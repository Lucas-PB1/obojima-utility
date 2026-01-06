import { logger } from '@/utils/logger';
import { adminDb } from '@/config/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, recipe } = body;

    if (!uid || !recipe) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const createdPotion = {
      potion: recipe.resultingPotion,
      recipe: {
        ...recipe,
        createdAt: new Date(recipe.createdAt)
      },
      quantity: 1,
      createdAt: new Date(),
      used: false
    };

    const docRef = await adminDb
      .collection('users')
      .doc(uid)
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
    logger.error('API Error adding created potion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

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
    logger.error('API Error fetching created potions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
