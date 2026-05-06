import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/config/firebase-admin';
import { apiAuthErrorResponse, requireUser } from '@/lib/server/apiAuth';
import { validateTradeItems } from '@/features/inventory/domain/tradeRules';
import { TradeItem } from '@/types/social';
import { logger } from '@/utils/logger';
import { assertCanInteract, createSocialNotification, getPublicProfile } from '@/lib/server/social';

interface TradeRequestBody {
  toUserId?: string;
  items?: TradeItem[];
}

function getInventoryCollection(type: TradeItem['type']) {
  return type === 'ingredient' ? 'collectedIngredients' : 'createdPotions';
}

function cleanTradeItems(items: TradeItem[]): TradeItem[] {
  return items.map((item) => {
    const cleanItem: TradeItem = {
      id: item.id,
      name: item.name,
      type: item.type,
      quantity: item.quantity
    };

    if (item.image) cleanItem.image = item.image;
    if (item.rarity) cleanItem.rarity = item.rarity;

    return cleanItem;
  });
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { toUserId, items = [] } = (await req.json()) as TradeRequestBody;

    if (!toUserId || toUserId === user.uid) {
      return NextResponse.json({ success: false, error: 'Invalid receiver ID' }, { status: 400 });
    }

    const validationError = validateTradeItems(items);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    await assertCanInteract(user.uid, toUserId);

    const cleanItems = cleanTradeItems(items);
    const senderProfile = await getPublicProfile(user.uid);

    await adminDb.runTransaction(async (transaction) => {
      const senderOps = cleanItems.map((item) => {
        const collectionName = getInventoryCollection(item.type);
        const senderRef = adminDb
          .collection('users')
          .doc(user.uid)
          .collection(collectionName)
          .doc(item.id);

        return { item, collectionName, senderRef };
      });

      const senderDocs = await Promise.all(
        senderOps.map(({ senderRef }) => transaction.get(senderRef))
      );

      const transferPayloads = await Promise.all(
        senderOps.map(async ({ item, collectionName, senderRef }, index) => {
          const senderDoc = senderDocs[index];

          if (!senderDoc.exists) {
            throw new Error(`Item ${item.name} not found in inventory`);
          }

          const senderData = senderDoc.data() || {};
          const senderQuantity = Number(senderData?.quantity || 0);

          if (senderQuantity < item.quantity) {
            throw new Error(`Not enough quantity for ${item.name}`);
          }

          let receiverRef = adminDb
            .collection('users')
            .doc(toUserId)
            .collection(collectionName)
            .doc();

          if (item.type === 'ingredient') {
            const receiverSnap = await transaction.get(
              adminDb
                .collection('users')
                .doc(toUserId)
                .collection(collectionName)
                .where('ingredient.id', '==', senderData?.ingredient?.id)
                .where('used', '==', false)
                .limit(1)
            );

            if (!receiverSnap.empty) {
              receiverRef = receiverSnap.docs[0].ref;
            }
          }

          const receiverDoc = await transaction.get(receiverRef);

          return {
            item,
            senderRef,
            senderData,
            senderQuantity,
            receiverRef,
            receiverDoc
          };
        })
      );

      for (const payload of transferPayloads) {
        const newSenderQuantity = payload.senderQuantity - payload.item.quantity;

        if (newSenderQuantity <= 0) {
          transaction.delete(payload.senderRef);
        } else {
          transaction.update(payload.senderRef, { quantity: newSenderQuantity });
        }

        if (payload.receiverDoc.exists) {
          const receiverQuantity = Number(payload.receiverDoc.data()?.quantity || 0);
          transaction.update(payload.receiverRef, {
            quantity: receiverQuantity + payload.item.quantity,
            used: false,
            usedAt: null
          });
        } else {
          const receiverData = {
            ...payload.senderData,
            quantity: payload.item.quantity,
            collectedAt: Timestamp.now(),
            used: false,
            usedAt: null
          };

          if (payload.item.type === 'potion') {
            transaction.set(payload.receiverRef, {
              ...receiverData,
              createdAt: Timestamp.now()
            });
          } else {
            transaction.set(payload.receiverRef, receiverData);
          }
        }
      }

      transaction.set(adminDb.collection('trades').doc(), {
        fromUserId: user.uid,
        toUserId,
        participants: [user.uid, toUserId],
        items: cleanItems,
        timestamp: Timestamp.now(),
        status: 'completed'
      });
    });

    await createSocialNotification({
      recipientId: toUserId,
      actorId: user.uid,
      actorName: senderProfile.displayName,
      type: 'trade',
      link: '/?tab=social',
      data: {
        itemCount: String(cleanItems.reduce((total, item) => total + item.quantity, 0))
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('API Error sending trade:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
