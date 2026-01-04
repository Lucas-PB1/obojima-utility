import {
  collection,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { authService } from '@/services/authService';
import { TradeItem } from '@/types/social';

export class TradeService {
  private getUserId(): string | null {
    return authService.getUserId();
  }

  async sendItems(toUserId: string, items: TradeItem[]): Promise<void> {
    const fromUserId = this.getUserId();
    if (!fromUserId) throw new Error('Not authenticated');

    await runTransaction(db, async (transaction) => {
      // 1. Prepare data and perform Sender Reads
      const senderOps = items.map((item) => {
        const senderCollectionPath =
          item.type === 'ingredient'
            ? `users/${fromUserId}/collectedIngredients`
            : `users/${fromUserId}/createdPotions`;
        const ref = doc(db, senderCollectionPath, item.id);
        return { item, ref };
      });

      const senderDocs = await Promise.all(
        senderOps.map(({ ref }) => transaction.get(ref))
      );

      // 2. Validate and Resolve Receiver Targets
      const transferPayloads = [];

      for (let i = 0; i < senderOps.length; i++) {
        const { item, ref: senderRef } = senderOps[i];
        const senderDoc = senderDocs[i];

        if (!senderDoc.exists()) {
          throw new Error(`Item ${item.name} not found in inventory`);
        }

        const sData = senderDoc.data();
        if (sData.quantity < item.quantity) {
          throw new Error(`Not enough quantity for ${item.name}`);
        }

        const receiverCollectionPath =
          item.type === 'ingredient'
            ? `users/${toUserId}/collectedIngredients`
            : `users/${toUserId}/createdPotions`;

        let receiverRef;

        if (item.type === 'ingredient') {
           const definitionId = sData.ingredient.id;
           const receiverColRef = collection(db, receiverCollectionPath);
           const q = query(
             receiverColRef,
             where('ingredient.id', '==', definitionId),
             where('used', '==', false)
           );
           // Non-transactional query to find candidate for stacking
           const receiverSnap = await getDocs(q); 
           if (!receiverSnap.empty) {
             receiverRef = receiverSnap.docs[0].ref;
           } else {
             receiverRef = doc(collection(db, receiverCollectionPath));
           }
        } else {
           // Potions always create new entry (or adjust logic if stacking desired)
           receiverRef = doc(collection(db, receiverCollectionPath));
        }
        
        transferPayloads.push({
            item,
            senderRef,
            senderData: sData,
            receiverRef
        });
      }

      // 3. Perform Receiver Reads
      const receiverDocs = await Promise.all(
          transferPayloads.map(({ receiverRef }) => transaction.get(receiverRef))
      );

      // 4. Perform Writes
      for (let i = 0; i < transferPayloads.length; i++) {
          const { item, senderRef, senderData, receiverRef } = transferPayloads[i];
          const receiverDoc = receiverDocs[i];

          // Update Sender
          const newSenderQty = senderData.quantity - item.quantity;
          if (newSenderQty <= 0) {
              transaction.delete(senderRef);
          } else {
              transaction.update(senderRef, { quantity: newSenderQty });
          }

          // Update Receiver
          if (receiverDoc.exists()) {
              const rData = receiverDoc.data();
              transaction.update(receiverRef, { quantity: rData.quantity + item.quantity });
          } else {
               const newItemData = {
                ...senderData,
                quantity: item.quantity,
                collectedAt: Timestamp.now(),
                used: false,
                usedAt: null
               };
               transaction.set(receiverRef, newItemData);
          }
      }

      // Record Trade
      const tradeRef = doc(collection(db, 'trades'));
      transaction.set(tradeRef, {
        fromUserId,
        toUserId,
        items: items,
        timestamp: Timestamp.now(),
        status: 'completed'
      });
    });
  }
}
