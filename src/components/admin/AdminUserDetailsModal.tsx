import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { UserProfile } from '@/types/auth';
import { useTranslation } from '@/hooks/useTranslation';
import { firebaseStorageService } from '@/services/firebaseStorageService';
import { firebaseCreatedPotionService } from '@/services/firebaseCreatedPotionService';
import { CollectedIngredient, CreatedPotion, ForageAttempt, Ingredient } from '@/types/ingredients';
import { Loader2 } from 'lucide-react';
import { useLocalizedIngredients } from '@/hooks/useLocalizedIngredients';
import { ingredientsService } from '@/services/ingredientsService';

interface AdminUserDetailsModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  onDelete: (uid: string, name: string) => Promise<void>;
}

export function AdminUserDetailsModal({ user, isOpen, onClose, onUpdate, onDelete }: AdminUserDetailsModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  type AvailableIngredient = Ingredient & { uniqueKey: string };
  const [availableIngredients, setAvailableIngredients] = useState<AvailableIngredient[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [selectedUniqueKey, setSelectedUniqueKey] = useState<string>('');
  const [addQuantity, setAddQuantity] = useState(1);
  
  // User Data State
  const [ingredients, setIngredients] = useState<CollectedIngredient[]>([]);
  const [potions, setPotions] = useState<CreatedPotion[]>([]);
  const [attempts, setAttempts] = useState<ForageAttempt[]>([]);

  const { localizeIngredient } = useLocalizedIngredients();

  // Load available ingredients for the "Add Item" feature
  useEffect(() => {
    const loadIngredients = async () => {
      const common = await ingredientsService.loadCommonIngredients();
      const uncommon = await ingredientsService.loadUncommonIngredients();
      const rare = await ingredientsService.loadRareIngredients();
      
      // Combine all ingredients with unique keys and explicit rarity
      const commonWithKey = common.ingredients.map(i => ({ 
        ...i, 
        raridade: 'comum' as const, 
        uniqueKey: `comum-${i.id}` 
      }));
      
      const uncommonWithKey = uncommon.ingredients.map(i => ({ 
        ...i, 
        raridade: 'incomum' as const, 
        uniqueKey: `incomum-${i.id}` 
      }));
      
      const rareWithKey = rare.ingredients.map(i => ({ 
        ...i, 
        raridade: 'raro' as const, 
        uniqueKey: `raro-${i.id}` 
      }));

      setAvailableIngredients([
        ...commonWithKey,
        ...uncommonWithKey,
        ...rareWithKey
      ].sort((a, b) => a.nome.localeCompare(b.nome)));
    };
    loadIngredients();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && user?.uid) {
      fetchUserData(user.uid);
    }
  }, [isOpen, user]);

  const fetchUserData = async (uid: string) => {
    setLoading(true);
    try {
      const [fetchedIngredients, fetchedPotions, fetchedAttempts] = await Promise.all([
        firebaseStorageService.getCollectedIngredients(uid),
        firebaseCreatedPotionService.getAllCreatedPotions(uid),
        firebaseStorageService.getForageAttempts(uid)
      ]);
      setIngredients(fetchedIngredients);
      setPotions(fetchedPotions);
      setAttempts(fetchedAttempts);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (confirm(t('admin.users.delete.confirm', user.displayName || 'User'))) {
        await onDelete(user.uid, user.displayName || 'User');
        onClose();
    }
  };

  if (!user) return null;

  const handleUpdateQuantity = async (id: string, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) {
      handleDeleteIngredient(id, 'Item');
      return;
    }
    try {
      await firebaseStorageService.updateCollectedIngredient(id, { quantity: newQty }, user.uid);
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    } catch (error) {
       console.error('Error updating quantity:', error);
    }
  };

  const handleAddItem = async () => {
    if (!selectedUniqueKey || !user) return;
    
    // Find the full ingredient object
    const ingredientToAdd = availableIngredients.find(i => i.uniqueKey === selectedUniqueKey);
    if (!ingredientToAdd) return;

    try {
      // Remove uniqueKey before saving to maintain clean data structure if needed, 
      // or keep it if it helps. internal types usually don't have it.
      // We construct a clean Ingredient object.
      const cleanIngredient: Ingredient = {
        id: ingredientToAdd.id,
        nome: ingredientToAdd.nome,
        combat: ingredientToAdd.combat,
        utility: ingredientToAdd.utility,
        whimsy: ingredientToAdd.whimsy,
        descricao: ingredientToAdd.descricao,
        raridade: ingredientToAdd.raridade
      };

      const newIngredient: CollectedIngredient = {
        id: '', // Generated by Firestore
        ingredient: cleanIngredient,
        quantity: addQuantity,
        collectedAt: new Date(),
        used: false,
        forageAttemptId: 'admin-add'
      };
      
      await firebaseStorageService.addCollectedIngredient(newIngredient, user.uid);
      
      // Refresh list
      const updatedIngredients = await firebaseStorageService.getCollectedIngredients(user.uid);
      setIngredients(updatedIngredients);
      
      setIsAddingItem(false);
      setSelectedUniqueKey('');
      setAddQuantity(1);
    } catch (error) {
      console.error('Error adding item:', error);
      alert(t('admin.modal.actions.add_error'));
    }
  };

  const handleDeleteIngredient = async (id: string, name: string) => {
    if (confirm(t('admin.modal.actions.remove_ingredient_confirm', name))) {
      try {
        await firebaseStorageService.removeCollectedIngredient(id, user.uid);
        setIngredients(prev => prev.filter(i => i.id !== id));
      } catch (error) {
        console.error('Error removing ingredient:', error);
        alert(t('admin.modal.actions.remove_ingredient_error'));
      }
    }
  };

  const handleDeletePotion = async (id: string, name: string) => {
    if (confirm(t('admin.modal.actions.remove_potion_confirm', name))) {
      try {
        await firebaseCreatedPotionService.removePotion(id, user.uid);
        setPotions(prev => prev.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error removing potion:', error);
        alert(t('admin.modal.actions.remove_potion_error'));
      }
    }
  };

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-3 font-medium text-sm transition-all duration-300 border-b-2 relative flex items-center justify-center gap-2 ${
        activeTab === id
          ? 'text-totoro-blue border-totoro-blue bg-totoro-blue/10'
          : 'text-totoro-gray border-transparent hover:text-totoro-blue hover:border-totoro-blue/30 hover:bg-totoro-blue/5'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user.displayName || t('admin.modal.title.fallback')} size="3xl">
      <div className="w-full h-[85vh] flex flex-col">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="grid w-full grid-cols-4 mb-4 border-b border-white/20 shrink-0">
            <TabButton id="overview" label={t('admin.modal.tabs.overview')} icon="👤" />
            <TabButton id="inventory" label={t('admin.modal.tabs.inventory')} icon="🎒" />
            <TabButton id="potions" label={t('admin.modal.tabs.potions')} icon="🧪" />
            <TabButton id="history" label={t('admin.modal.tabs.history')} icon="📜" />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-totoro-green" />
              </div>
            ) : (
              <>
                {/* ... Overview Tab ... */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="glass-panel p-6">
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="text-xl font-bold text-totoro-green">{t('admin.modal.section.profile')}</h3>
                         <div className="flex gap-2">
                            <button 
                                onClick={() => {
                                    const newName = prompt(t('admin.modal.actions.edit_name'), user.displayName || '');
                                    if(newName && newName !== user.displayName) onUpdate(user.uid, { displayName: newName });
                                }}
                                className="px-3 py-1 text-xs font-bold text-totoro-blue bg-totoro-blue/10 rounded-lg hover:bg-totoro-blue hover:text-white transition-colors"
                            >
                                {t('admin.users.action.edit')}
                            </button>
                            <button 
                                onClick={() => onUpdate(user.uid, { disabled: !user.disabled })}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${user.disabled ? 'text-green-600 bg-green-100 hover:bg-green-600 hover:text-white' : 'text-amber-600 bg-amber-100 hover:bg-amber-600 hover:text-white'}`}
                            >
                                {user.disabled ? t('admin.users.action.enable') : t('admin.users.action.disable')}
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-3 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-colors"
                            >
                                {t('admin.users.action.delete')}
                            </button>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-500">{t('admin.users.col.name')}</label>
                          <p className="font-medium">{user.displayName || t('admin.users.noName')}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">{t('admin.users.col.email')}</label>
                          <p className="font-medium">{user.email || t('admin.users.noEmail')}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">{t('admin.users.col.role')}</label>
                          <div className="flex items-center gap-2">
                              <select 
                                value={user.role} 
                                onChange={(e) => {
                                    if(confirm(t('admin.modal.actions.change_role', e.target.value))) {
                                        onUpdate(user.uid, { role: e.target.value as any });
                                    }
                                }}
                                className="bg-transparent font-medium capitalize outline-none cursor-pointer hover:bg-black/5 rounded px-1"
                              >
                                  <option value="user">User</option>
                                  <option value="admin">Admin</option>
                              </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500">UID</label>
                          <p className="font-medium text-xs font-mono">{user.uid}</p>
                        </div>
                         <div>
                          <label className="text-sm text-gray-500">{t('admin.users.col.status')}</label>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {user.disabled ? t('admin.users.status.disabled') : t('admin.users.status.active')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6">
                      <h3 className="text-xl font-bold mb-4 text-totoro-blue">{t('admin.modal.section.stats')}</h3>
                      <div className="grid grid-cols-3 gap-4 text-center">
                         <div className="p-3 bg-white/50 rounded-lg">
                           <div className="text-2xl font-bold text-totoro-green">{ingredients.length}</div>
                           <div className="text-xs text-gray-600">{t('admin.modal.tabs.inventory')}</div>
                         </div>
                         <div className="p-3 bg-white/50 rounded-lg">
                           <div className="text-2xl font-bold text-totoro-blue">{potions.length}</div>
                           <div className="text-xs text-gray-600">{t('admin.modal.tabs.potions')}</div>
                         </div>
                         <div className="p-3 bg-white/50 rounded-lg">
                           <div className="text-2xl font-bold text-totoro-orange">{attempts.length}</div>
                           <div className="text-xs text-gray-600">{t('admin.modal.tabs.history')}</div>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="glass-panel p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">{t('admin.modal.inventory.title')}</h3>
                        <button 
                            onClick={() => setIsAddingItem(!isAddingItem)}
                            className="text-xs bg-totoro-green/10 text-totoro-green px-3 py-1 rounded hover:bg-totoro-green hover:text-white transition-colors"
                        >
                            {isAddingItem ? t('admin.modal.inventory.add.cancel') : t('admin.modal.inventory.add.button')}
                        </button>
                    </div>

                    {isAddingItem && (
                        <div className="bg-white/50 p-4 rounded-lg mb-4 flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-xs font-medium block mb-1">{t('admin.modal.inventory.add.label')}</label>
                                <select 
                                    className="w-full text-sm p-2 rounded border border-gray-200"
                                    value={selectedUniqueKey}
                                    onChange={(e) => setSelectedUniqueKey(e.target.value)}
                                >
                                    <option value="">{t('admin.modal.inventory.add.select_placeholder')}</option>
                                    {availableIngredients.map(ing => (
                                        <option key={ing.uniqueKey} value={ing.uniqueKey}>
                                            {ing.nome} ({ing.raridade})
                                        </option>
                                    ))}
                                </select>
                            </div>
                             <div className="w-20">
                                <label className="text-xs font-medium block mb-1">{t('admin.modal.inventory.add.qty')}</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    className="w-full text-sm p-2 rounded border border-gray-200"
                                    value={addQuantity}
                                    onChange={(e) => setAddQuantity(Number(e.target.value))}
                                />
                            </div>
                            <button 
                                onClick={handleAddItem}
                                disabled={!selectedUniqueKey}
                                className="bg-totoro-green text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50"
                            >
                                {t('admin.modal.inventory.add.confirm')}
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                       <div className="grid grid-cols-12 gap-2 px-2 py-1 text-xs font-medium text-gray-500 uppercase">
                          <div className="col-span-4">{t('admin.modal.inventory.table.item')}</div>
                          <div className="col-span-3 text-center">{t('admin.modal.inventory.table.status')}</div>
                          <div className="col-span-3">{t('admin.modal.inventory.table.acquired')}</div>
                          <div className="col-span-2 text-right">{t('admin.modal.inventory.table.actions')}</div>
                       </div>
                      {ingredients.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">{t('admin.modal.empty.ingredients')}</p>
                      ) : (
                        ingredients.map((item) => {
                          const localized = localizeIngredient(item.ingredient);
                          return (
                            <div key={item.id} className="bg-white/40 p-2 rounded-lg grid grid-cols-12 gap-2 items-center hover:bg-white/60 transition-colors">
                              <div className="col-span-4 flex items-center gap-2 overflow-hidden">
                                <span className="text-xl">🌿</span>
                                <span className="font-medium truncate text-sm" title={localized.nome}>
                                    {localized.nome}
                                </span>
                              </div>
                              <div className="col-span-3 flex justify-center">
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.used ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                      {item.used ? t('admin.modal.inventory.status.used') : t('admin.modal.inventory.status.available')}
                                  </span>
                              </div>
                               <div className="col-span-3 text-xs text-gray-600 truncate">
                                  {item.collectedAt ? new Date(item.collectedAt).toLocaleDateString() : '-'}
                              </div>
                              <div className="col-span-2 flex items-center justify-end gap-1">
                                <div className="flex items-center bg-white/50 rounded overflow-hidden">
                                    <button 
                                        className="px-2 py-1 hover:bg-gray-200 text-xs"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                    >
                                        -
                                    </button>
                                    <span className="px-1 text-xs font-medium min-w-[20px] text-center">{item.quantity}</span>
                                    <button 
                                        className="px-2 py-1 hover:bg-gray-200 text-xs"
                                         onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteIngredient(item.id, localized.nome); }}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title={t('admin.modal.actions.remove')}
                                >
                                    🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'potions' && (
                   <div className="glass-panel p-4">
                    <div className="flex flex-col gap-2">
                       <div className="mb-2 text-xs font-medium text-gray-500 uppercase px-2">{t('admin.modal.potions.title')}</div>
                      {potions.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">{t('admin.modal.empty.potions')}</p>
                      ) : (
                        potions.map((potion) => (
                          <div key={potion.id} className="bg-white/40 p-3 rounded-lg flex items-center justify-between group hover:bg-white/60 transition-colors">
                             <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 rounded-full bg-totoro-blue/20 flex items-center justify-center text-xl shrink-0">
                                    🧪
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h4 className="font-medium truncate text-sm">{potion.recipe.resultingPotion.nome}</h4>
                                    <p className="text-xs text-gray-500 truncate">{potion.recipe.resultingPotion.descricao}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 ml-4">
                                <span className="font-bold text-totoro-blue bg-white/50 px-2 py-1 rounded text-sm">x{potion.quantity}</span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeletePotion(potion.id, potion.recipe.resultingPotion.nome); }}
                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                    title={t('admin.modal.actions.remove')}
                                >
                                    🗑️
                                </button>
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* ... History Tab ... */}
                {activeTab === 'history' && (
                   <div className="glass-panel p-0 overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-white/50 text-gray-700">
                             <tr>
                               <th className="px-4 py-3 font-medium">{t('ui.labels.date')}</th>
                               <th className="px-4 py-3 font-medium">{t('forage.form.region')}</th>
                               <th className="px-4 py-3 font-medium">{t('activity.card.roll')}</th>
                               <th className="px-4 py-3 font-medium">{t('activity.filters.result.label')}</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200/50">
                            {attempts.map((attempt) => (
                              <tr key={attempt.id} className="hover:bg-white/30">
                                <td className="px-4 py-3 text-gray-600">
                                  {new Date(attempt.timestamp).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 capitalize">{attempt.region}</td>
                                <td className="px-4 py-3 font-mono">{attempt.roll}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    attempt.success 
                                      ? 'bg-totoro-green/20 text-totoro-green' 
                                      : 'bg-totoro-orange/20 text-totoro-orange'
                                  }`}>
                                    {attempt.success ? t('admin.modal.history.success') : t('admin.modal.history.failure')}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                     </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
