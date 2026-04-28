import { logger } from '@/utils/logger';
import { adminDb } from '@/config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { apiAuthErrorResponse, assertCanAccessUser, requireUser } from '@/lib/server/apiAuth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const body = await req.json();
    const { recipe, quantity } = body;

    if (!recipe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const createdPotion = {
      potion: recipe.resultingPotion,
      recipe: {
        ...recipe,
        createdAt: new Date(recipe.createdAt)
      },
      quantity: quantity || 1,
      createdAt: new Date(),
      used: false
    };

    const docRef = await adminDb
      .collection('users')
      .doc(user.uid)
      .collection('createdPotions')
      .add({
        ...createdPotion,
        recipe: {
          ...createdPotion.recipe,
          createdAt: Timestamp.fromDate(createdPotion.recipe.createdAt)
        },
        createdAt: Timestamp.fromDate(createdPotion.createdAt)
      });

    return NextResponse.json({
      success: true,
      data: {
        ...createdPotion,
        id: docRef.id
      }
    });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('API Error adding created potion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid') || user.uid;

    await assertCanAccessUser(user, uid);

    const snapshot = await adminDb.collection('users').doc(uid).collection('createdPotions').get();

    const potions = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        usedAt: data.usedAt?.toDate?.()?.toISOString() || data.usedAt,
        recipe: {
          ...data.recipe,
          createdAt: data.recipe?.createdAt?.toDate?.()?.toISOString() || data.recipe?.createdAt
        }
      };
    });

    return NextResponse.json({ success: true, data: potions });
  } catch (error) {
    const authResponse = apiAuthErrorResponse(error);
    if (authResponse) return authResponse;

    logger.error('API Error fetching created potions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
