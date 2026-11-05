'use client';
import React, { useMemo, useState } from 'react';
import { Gift, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { useIngredientsCatalog } from '@/hooks/useIngredientsCatalog';
import { usePotionsCatalog } from '@/hooks/usePotionsCatalog';
import { ADMIN_MAX_GRANT_QUANTITY } from '../domain/adminRules';
import { AdminGrantPayload, AdminItemType } from '../types';

const RARITY_LABELS: Record<string, string> = {
  comum: 'Comum',
  incomum: 'Incomum',
  raro: 'Raro',
  unico: 'Único'
};

const CATEGORY_LABELS = { combat: 'Combate', utility: 'Utilidade', whimsy: 'Caprichosa' };

interface Option {
  key: string;
  label: string;
  hint: string;
  build: (quantity: number, notify: boolean) => AdminGrantPayload;
}

function useIngredientOptions(): Option[] {
  const { availableIngredients } = useIngredientsCatalog();
  return useMemo(
    () =>
      availableIngredients.map(({ uniqueKey, ...ingredient }) => ({
        key: uniqueKey,
        label: ingredient.nome,
        hint: RARITY_LABELS[ingredient.raridade || 'comum'] || ingredient.raridade || '',
        build: (quantity, notify) => ({ type: 'ingredient', item: ingredient, quantity, notify })
      })),
    [availableIngredients]
  );
}

function usePotionOptions(): Option[] {
  const { availablePotions } = usePotionsCatalog();
  return useMemo(
    () =>
      availablePotions.map(({ uniqueKey, winningAttribute, ...potion }) => ({
        key: uniqueKey,
        label: potion.nome,
        hint: `${CATEGORY_LABELS[winningAttribute]} · ${potion.raridade}`,
        build: (quantity, notify) => ({
          type: 'potion',
          item: potion,
          category: winningAttribute,
          quantity,
          notify
        })
      })),
    [availablePotions]
  );
}

function GrantFormBody({
  options,
  busy,
  onGrant
}: {
  options: Option[];
  busy: boolean;
  onGrant: (payload: AdminGrantPayload) => Promise<boolean>;
}) {
  const [term, setTerm] = useState('');
  const [selected, setSelected] = useState<Option | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notify, setNotify] = useState(true);

  const filtered = useMemo(() => {
    const value = term.trim().toLowerCase();
    return (
      value ? options.filter((option) => option.label.toLowerCase().includes(value)) : options
    ).slice(0, 40);
  }, [options, term]);

  const safeQuantity = Math.min(ADMIN_MAX_GRANT_QUANTITY, Math.max(1, Math.floor(quantity) || 1));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/35" />
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={`Buscar no catálogo (${options.length} itens)`}
          aria-label="Buscar no catálogo"
          className="w-full rounded-lg bg-[var(--input-bg)] py-2.5 pl-10 pr-3 text-sm shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15"
        />
      </div>
      <div
        className="max-h-48 overflow-y-auto rounded-lg ring-1 ring-inset ring-[var(--hairline)]"
        role="listbox"
      >
        {options.length === 0 ? (
          <p className="p-4 text-center text-sm text-foreground/50">Carregando catálogo...</p>
        ) : filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-foreground/50">Nada encontrado.</p>
        ) : (
          filtered.map((option) => (
            <button
              key={option.key}
              type="button"
              role="option"
              aria-selected={selected?.key === option.key}
              onClick={() => setSelected(option)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition ${
                selected?.key === option.key
                  ? 'bg-totoro-blue/12 font-bold text-totoro-blue'
                  : 'hover:bg-[var(--surface-hover)]'
              }`}
            >
              <span className="truncate">{option.label}</span>
              <span className="shrink-0 text-[11px] text-foreground/50">{option.hint}</span>
            </button>
          ))
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="block text-xs font-bold text-foreground/60">Quantidade</span>
          <input
            type="number"
            min={1}
            max={ADMIN_MAX_GRANT_QUANTITY}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-24 rounded-lg bg-[var(--input-bg)] px-3 py-2 text-sm font-bold shadow-[inset_0_0_0_1px_var(--hairline)] outline-none focus:ring-4 focus:ring-totoro-blue/15"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-foreground/75">
          <input
            type="checkbox"
            checked={notify}
            onChange={(event) => setNotify(event.target.checked)}
            className="h-4 w-4 accent-totoro-blue"
          />
          Avisar o jogador
        </label>
        <Button
          size="sm"
          className="ml-auto"
          disabled={!selected || busy}
          onClick={async () => {
            if (!selected) return;
            const ok = await onGrant(selected.build(safeQuantity, notify));
            if (ok) {
              setSelected(null);
              setQuantity(1);
            }
          }}
        >
          <Gift className="h-4 w-4" />
          {selected ? `Conceder ${safeQuantity}x ${selected.label}` : 'Escolha um item'}
        </Button>
      </div>
    </div>
  );
}

export function AdminGrantForm({
  type,
  busy,
  onGrant
}: {
  type: AdminItemType;
  busy: boolean;
  onGrant: (payload: AdminGrantPayload) => Promise<boolean>;
}) {
  return type === 'ingredient' ? (
    <IngredientGrant busy={busy} onGrant={onGrant} />
  ) : (
    <PotionGrant busy={busy} onGrant={onGrant} />
  );
}

function IngredientGrant(props: {
  busy: boolean;
  onGrant: (p: AdminGrantPayload) => Promise<boolean>;
}) {
  return <GrantFormBody options={useIngredientOptions()} {...props} />;
}

function PotionGrant(props: {
  busy: boolean;
  onGrant: (p: AdminGrantPayload) => Promise<boolean>;
}) {
  return <GrantFormBody options={usePotionOptions()} {...props} />;
}
