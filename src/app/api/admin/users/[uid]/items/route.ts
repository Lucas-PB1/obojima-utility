import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireAdmin } from '@/lib/server/apiAuth';
import { logAdminAction } from '@/lib/server/adminAudit';
import { createSocialNotification } from '@/lib/server/social';
import { ADMIN_MAX_GRANT_QUANTITY, validateGrantPayload } from '@/features/admin/domain/adminRules';
import { AdminGrantPayload, AdminItemType } from '@/features/admin/types';
import { logger } from '@/utils/logger';

type Params = { params: Promise<{ uid: string }> };

function collectionFor(type: AdminItemType) {
  return type === 'ingredient' ? 'collectedIngredients' : 'createdPotions';
}

function errorResponse(error: unknown, fallback: string) {
  const authResponse = apiAuthErrorResponse(error);
  if (authResponse) return authResponse;
  logger.error(fallback, error);
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

/** Grants a catalog ingredient or potion to the player. */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;
    const payload = (await req.json()) as Partial<AdminGrantPayload>;

    const validationError = validateGrantPayload(payload);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }
    const { type, item, category, quantity, notify } = payload as AdminGrantPayload;

    const userRef = adminDb.collection('users').doc(uid);
    if (!(await userRef.get()).exists) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    const inventory = userRef.collection(collectionFor(type));
    const now = Timestamp.now();
    let itemId: string;

    if (type === 'ingredient') {
      // Stack onto an existing unused entry of the same ingredient, like a trade does.
      const existing = await inventory
        .where('ingredient.id', '==', item.id)
        .where('used', '==', false)
        .limit(5)
        .get();
      const match = existing.docs.find((doc) => doc.data().ingredient?.nome === item.nome);

      if (match) {
        const current = Number(match.data().quantity || 0);
        await match.ref.update({
          quantity: Math.min(current + quantity, ADMIN_MAX_GRANT_QUANTITY * 10),
          collectedAt: now,
          used: false,
          usedAt: null
        });
        itemId = match.id;
      } else {
        const ref = await inventory.add({
          ingredient: item,
          quantity,
          collectedAt: now,
          used: false,
          usedAt: null,
          forageAttemptId: 'admin-grant'
        });
        itemId = ref.id;
      }
    } else {
      const ref = await inventory.add({
        potion: item,
        recipe: {
          id: `admin-grant-${Date.now()}`,
          ingredients: [],
          combatScore: 0,
          utilityScore: 0,
          whimsyScore: 0,
          winningAttribute: category,
          resultingPotion: item,
          createdAt: now
        },
        quantity,
        createdAt: now,
        used: false
      });
      itemId = ref.id;
    }

    const label = `${quantity}x ${item.nome}`;
    await logAdminAction(
      admin,
      'item.grant',
      `Concedeu ${label} (${type === 'ingredient' ? 'ingrediente' : 'poção'})`,
      uid
    );

    if (notify) {
      await createSocialNotification({
        recipientId: uid,
        type: 'system',
        actorName: 'Obojima',
        title: 'Presente recebido',
        body: `Você recebeu ${label} da equipe de Obojima.`
      }).catch((error) => logger.warn('Falha ao notificar concessão:', error));
    }

    return NextResponse.json({ success: true, itemId });
  } catch (error) {
    return errorResponse(error, 'Falha ao conceder item');
  }
}

/** Sets the exact quantity of an inventory entry. */
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;
    const body = (await req.json()) as { type?: AdminItemType; itemId?: string; quantity?: number };
    const quantity = Number(body.quantity);

    if ((body.type !== 'ingredient' && body.type !== 'potion') || !body.itemId) {
      return NextResponse.json({ success: false, error: 'Item inválido' }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > ADMIN_MAX_GRANT_QUANTITY * 10) {
      return NextResponse.json({ success: false, error: 'Quantidade inválida' }, { status: 400 });
    }

    const ref = adminDb
      .collection('users')
      .doc(uid)
      .collection(collectionFor(body.type))
      .doc(body.itemId);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    }

    const data = snapshot.data() || {};
    const previous = Number(data.quantity || 0);
    await ref.update({ quantity, used: false, usedAt: null });

    const name = data.ingredient?.nome || data.potion?.nome || body.itemId;
    await logAdminAction(
      admin,
      'item.update',
      `${name}: quantidade ${previous} → ${quantity}`,
      uid
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Falha ao atualizar item');
  }
}

/** Removes an inventory entry: /items?type=ingredient&itemId=... */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(req);
    const { uid } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as AdminItemType | null;
    const itemId = searchParams.get('itemId');

    if ((type !== 'ingredient' && type !== 'potion') || !itemId) {
      return NextResponse.json({ success: false, error: 'Item inválido' }, { status: 400 });
    }

    const ref = adminDb.collection('users').doc(uid).collection(collectionFor(type)).doc(itemId);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return NextResponse.json({ success: false, error: 'Item não encontrado' }, { status: 404 });
    }

    const data = snapshot.data() || {};
    await ref.delete();
    const name = data.ingredient?.nome || data.potion?.nome || itemId;
    await logAdminAction(admin, 'item.delete', `Removeu ${data.quantity || 0}x ${name}`, uid);

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error, 'Falha ao remover item');
  }
}
