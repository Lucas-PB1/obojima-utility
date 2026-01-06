import React from 'react';
import { ArrowRight, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Friend } from '@/types/social';
import { Button, Modal } from '@/components/ui';
import { useTrade } from '@/hooks/useTrade';

interface TradeModalProps {
  friend: Friend;
  onClose: () => void;
}

import { useEnglishPotionNames } from '@/hooks/useEnglishPotionNames';
import { useEnglishIngredientNames } from '@/hooks/useEnglishIngredientNames';

export function TradeModal({ friend, onClose }: TradeModalProps) {
  const { t } = useTranslation();
  const { getEnglishName: getPotionEnglishName } = useEnglishPotionNames();
  const { getEnglishName: getIngredientEnglishName } = useEnglishIngredientNames();
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
    cart,
    addToCart,
    removeFromCart,
    handleSend,
    localizeIngredient,
    maxAddable
  } = useTrade(friend, onClose);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-totoro-blue" />
          <span>{t('social.trade.title')}</span>
          <ArrowRight className="w-4 h-4 text-totoro-gray/40" />
          <span className="text-totoro-blue">{friend.displayName}</span>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex gap-2 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => {
                setItemType('ingredient');
                setSelectedItemId('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${itemType === 'ingredient' ? 'bg-totoro-blue text-white shadow-md' : 'text-totoro-gray/50 hover:bg-white/5'}`}
            >
              {t('social.trade.type.ingredient')}
            </button>
            <button
              onClick={() => {
                setItemType('potion');
                setSelectedItemId('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${itemType === 'potion' ? 'bg-totoro-blue text-white shadow-md' : 'text-totoro-gray/50 hover:bg-white/5'}`}
            >
              {t('social.trade.type.potion')}
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-totoro-gray/60 uppercase tracking-wider mb-2 block">
              {t('social.trade.selectItem')}
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20">
              {itemType === 'ingredient' ? (
                availableIngredients.length > 0 ? (
                  availableIngredients.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => setSelectedItemId(ing.id)}
                      className={`
                        cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between
                        ${selectedItemId === ing.id ? 'bg-totoro-blue/10 border-totoro-blue/50 shadow-sm' : 'bg-white/5 border-transparent hover:bg-white/10'}
                      `}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-totoro-gray">
                          {localizeIngredient(ing.ingredient).nome}
                        </span>
                        <span className="text-[10px] text-totoro-gray/50 italic">
                          {getIngredientEnglishName(ing.ingredient.id, ing.ingredient.raridade)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-totoro-gray/40 uppercase font-bold">
                          {ing.ingredient.raridade || 'comum'}
                        </span>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-mono">
                          {ing.quantity}x
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-totoro-gray/50 p-4 text-center italic bg-white/5 rounded-xl">
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
                      ${selectedItemId === pot.id ? 'bg-totoro-blue/10 border-totoro-blue/50 shadow-sm' : 'bg-white/5 border-transparent hover:bg-white/10'}
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-totoro-gray">{pot.potion.nome}</span>
                      <span className="text-[10px] text-totoro-gray/50 italic">
                        {getPotionEnglishName(pot.recipe.winningAttribute, pot.potion.id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-totoro-gray/40 uppercase font-bold">
                        {pot.potion.raridade}
                      </span>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-mono">
                        {pot.quantity}x
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-totoro-gray/50 p-4 text-center italic bg-white/5 rounded-xl">
                  {t('social.trade.noItems')}
                </p>
              )}
            </div>
          </div>

          {selectedItemId && (
            <div className="flex items-end gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex-1">
                <label className="text-xs font-bold text-totoro-gray/60 uppercase tracking-wider mb-2 flex justify-between">
                  <span>{t('social.trade.quantity')}</span>
                  <span className="text-[10px] text-totoro-blue">
                    {maxAddable === 0
                      ? t('social.trade.maxInCart')
                      : t('social.trade.available', maxAddable)}
                  </span>
                </label>
                <div
                  className={`flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 ${maxAddable === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <input
                    type="range"
                    min="1"
                    max={maxAddable || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="flex-1 accent-totoro-blue"
                    disabled={maxAddable === 0}
                  />
                  <span className="font-bold text-lg w-8 text-center bg-white/10 rounded-md py-0.5">
                    {quantity}
                  </span>
                </div>
              </div>
              <Button
                onClick={addToCart}
                disabled={maxAddable === 0}
                className={`h-[52px] px-6 transition-all ${maxAddable === 0 ? 'bg-gray-200 text-gray-400' : 'bg-totoro-green hover:bg-totoro-green/90 text-white shadow-lg shadow-green-500/20'}`}
              >
                {maxAddable === 0 ? (
                  <span className="text-xs font-bold">MAX</span>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-1" />
                    {t('social.trade.addToCart')}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Cart Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-totoro-gray flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              {t('social.trade.itemsToSend')}
            </h4>
            <span className="text-xs font-bold bg-totoro-blue/10 text-totoro-blue px-2 py-1 rounded-full">
              {t(
                'social.trade.itemsCount',
                cart.reduce((acc, item) => acc + item.quantity, 0)
              )}
            </span>
          </div>

          <div className="min-h-[100px] max-h-[150px] overflow-y-auto bg-white/5 rounded-xl border border-white/10 p-2 space-y-2 relative">
            {cart.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-totoro-gray/30 font-medium italic">
                {t('social.trade.noItemsSelected')}
              </div>
            ) : (
              cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between p-3 bg-white/40 rounded-lg shadow-sm animate-in fade-in slide-in-from-left-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-8 rounded-full ${item.type === 'ingredient' ? 'bg-totoro-green' : 'bg-totoro-blue'}`}
                    ></div>
                    <div>
                      <p className="font-bold text-sm text-totoro-gray">{item.name}</p>
                      <p className="text-[10px] text-totoro-gray/50 uppercase font-bold">
                        {item.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm bg-white/50 px-2 py-1 rounded-md">
                      x{item.quantity}
                    </span>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1.5 hover:bg-red-100/50 text-totoro-gray/40 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-3 rounded-xl text-center text-sm font-bold animate-in zoom-in-95 ${message.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
          >
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            {t('social.trade.cancel')}
          </Button>
          <Button
            onClick={handleSend}
            disabled={loading || cart.length === 0}
            className="flex-[2] bg-gradient-to-r from-totoro-blue to-blue-500 hover:shadow-lg hover:shadow-blue-500/20 text-white transition-all disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? t('social.trade.sending') : `${t('social.trade.send')} (${cart.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
