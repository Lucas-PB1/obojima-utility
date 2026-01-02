import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend } from '@/types/social';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useTrade } from '@/hooks/useTrade';

interface TradeModalProps {
  friend: Friend;
  onClose: () => void;
}

export default function TradeModal({ friend, onClose }: TradeModalProps) {
  const { t } = useTranslation();
  const {
    itemType,
    setItemType,
    selectedItemId,
    setSelectedItemId,
    quantity,
    setQuantity,
    loading,
    message,
    availableIngredients,
    availablePotions,
    selectedItem,
    handleSend,
    localizeIngredient
  } = useTrade(friend, onClose);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{t('social.trade.title')}</span>
          <ArrowRight className="w-5 h-5 text-totoro-blue" />
          <span className="text-totoro-blue">{friend.displayName}</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Type Selector */}
        <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
          <button
            onClick={() => {
              setItemType('ingredient');
              setSelectedItemId('');
            }}
            className={`flex-1 py-2 rounded text-sm font-bold ${itemType === 'ingredient' ? 'bg-totoro-blue text-white' : 'text-totoro-gray/50 hover:bg-white/10'}`}
          >
            {t('social.trade.type.ingredient')}
          </button>
          <button
            onClick={() => {
              setItemType('potion');
              setSelectedItemId('');
            }}
            className={`flex-1 py-2 rounded text-sm font-bold ${itemType === 'potion' ? 'bg-totoro-blue text-white' : 'text-totoro-gray/50 hover:bg-white/10'}`}
          >
            {t('social.trade.type.potion')}
          </button>
        </div>

        {/* Item Selector */}
        <div>
          <label className="text-xs font-bold text-totoro-gray/60 uppercase tracking-wider mb-2 block">
            {t('social.trade.selectItem')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-1">
            {itemType === 'ingredient' ? (
              availableIngredients.length > 0 ? (
                availableIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    onClick={() => setSelectedItemId(ing.id)}
                    className={`
                                        cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between
                                        ${selectedItemId === ing.id ? 'bg-totoro-blue/10 border-totoro-blue ring-1 ring-totoro-blue' : 'bg-white/5 border-transparent hover:bg-white/10'}
                                    `}
                  >
                    <span className="text-sm font-bold text-totoro-gray">
                      {localizeIngredient(ing.ingredient).nome}
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {ing.quantity}x
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-totoro-gray/50 p-2 italic">
                  {t('social.trade.noItems')}
                </p>
              )
            ) : availablePotions.length > 0 ? (
              availablePotions.map((pot) => (
                <div
                  key={pot.id}
                  onClick={() => setSelectedItemId(pot.id)}
                  className={`
                                        cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between
                                        ${selectedItemId === pot.id ? 'bg-totoro-blue/10 border-totoro-blue ring-1 ring-totoro-blue' : 'bg-white/5 border-transparent hover:bg-white/10'}
                                    `}
                >
                  <span className="text-sm font-bold text-totoro-gray">{pot.potion.nome}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {pot.quantity}x
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-totoro-gray/50 p-2 italic">{t('social.trade.noItems')}</p>
            )}
          </div>
        </div>

        {/* Quantity */}
        {selectedItemId && (
          <div>
            <label className="text-xs font-bold text-totoro-gray/60 uppercase tracking-wider mb-2 block">
              {t('social.trade.quantity')}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max={selectedItem?.quantity || 1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1"
              />
              <span className="font-bold text-xl w-8 text-center">{quantity}</span>
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-xl text-center text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {t('social.trade.cancel')}
          </Button>
          <Button onClick={handleSend} disabled={loading || !selectedItemId} className="flex-1">
            {loading ? '...' : t('social.trade.send')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
