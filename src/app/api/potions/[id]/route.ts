import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import { logger } from '@/utils/logger';
import { Timestamp } from 'firebase-admin/firestore';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const docSnap = await adminDb
      .collection('users')
      .doc(uid)
      .collection('createdPotions')
      .doc(id)
      .get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: 'Potion not found' }, { status: 404 });
    }

    const data = docSnap.data();
    const potion = {
      ...data,
      id: docSnap.id,
      createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
      usedAt: data?.usedAt?.toDate?.()?.toISOString() || data?.usedAt,
      recipe: {
        ...data?.recipe,
        createdAt: data?.recipe?.createdAt?.toDate?.()?.toISOString() || data?.recipe?.createdAt
      }
    };

    return NextResponse.json({ success: true, data: potion });
  } catch (error) {
    logger.error('API Error fetching potion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    await adminDb.collection('users').doc(uid).collection('createdPotions').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('API Error deleting potion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { uid, action } = body;

    if (!uid) {
      return NextResponse.json({ error: 'Missing uid' }, { status: 400 });
    }

    const potionRef = adminDb.collection('users').doc(uid).collection('createdPotions').doc(id);

    if (action === 'use') {
      const docSnap = await potionRef.get();
      if (!docSnap.exists) {
        return NextResponse.json({ error: 'Potion not found' }, { status: 404 });
      }

      const potion = docSnap.data();
      if (!potion || potion.quantity <= 0) {
        return NextResponse.json({ error: 'Potion unavailable' }, { status: 400 });
      }

      const newQuantity = potion.quantity - 1;

      if (newQuantity === 0) {
        await potionRef.update({
          quantity: 0,
          used: true,
          usedAt: Timestamp.now()
        });
      } else {
        await potionRef.update({
          quantity: newQuantity
        });
      }

      return NextResponse.json({ success: true, newQuantity });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('API Error updating potion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
