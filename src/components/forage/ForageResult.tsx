import React from 'react';
import { ForageAttempt } from '@/types/ingredients';
import { ingredientsService } from '@/services/ingredientsService';
import { settingsService } from '@/services/settingsService';
import ContentCard from '../ui/ContentCard';

interface ForageResultProps {
  result: ForageAttempt | null;
}

export default function ForageResult({ result }: ForageResultProps) {
  if (!result) return null;

  return (
    <ContentCard>
      <div className={`relative overflow-hidden rounded-2xl border-2 ${
        result.success 
          ? 'bg-gradient-to-br from-totoro-green/10 via-totoro-blue/10 to-totoro-yellow/10 border-totoro-green/30 shadow-totoro-green/20' 
          : 'bg-gradient-to-br from-totoro-orange/10 via-totoro-gray/10 to-totoro-orange/10 border-totoro-orange/30 shadow-totoro-orange/20'
      } shadow-lg`}>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className={`w-full h-full rounded-full ${
            result.success ? 'bg-totoro-green' : 'bg-totoro-orange'
          } transform translate-x-16 -translate-y-16`}></div>
        </div>
        <div className="absolute bottom-0 left-0 w-24 h-24 opacity-10">
          <div className={`w-full h-full rounded-full ${
            result.success ? 'bg-totoro-blue' : 'bg-totoro-gray'
          } transform -translate-x-12 translate-y-12`}></div>
        </div>
        
        <div className="relative p-6">
          <div className="text-center mb-6">
            <div className={`text-5xl mb-3 ${
              result.success ? 'text-totoro-green' : 'text-totoro-orange'
            }`}>
              {result.success ? '✨' : '🌙'}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              result.success ? 'text-totoro-green' : 'text-totoro-orange'
            }`}>
              {result.success ? 'Sucesso!' : 'Falha!'}
            </h3>
            <p className={`text-sm ${
              result.success ? 'text-totoro-green' : 'text-totoro-orange'
            }`}>
              {result.success ? 'Você encontrou algo especial!' : 'A natureza guarda seus segredos...'}
            </p>
          </div>

          <div className={`text-center mb-6 p-4 rounded-xl ${
            result.success 
              ? 'bg-totoro-green/20 border border-totoro-green/30' 
              : 'bg-totoro-orange/20 border border-totoro-orange/30'
          }`}>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-totoro-gray/60 mb-1">Sua Rolagem</p>
                <p className={`text-3xl font-bold ${
                  result.success ? 'text-totoro-green' : 'text-totoro-orange'
                }`}>
                  {result.roll}
                </p>
              </div>
              <div className="text-2xl text-totoro-gray/40">vs</div>
              <div className="text-center">
                <p className="text-xs text-totoro-gray/60 mb-1">Dificuldade</p>
                <p className="text-3xl font-bold text-totoro-blue">{result.dcRange}</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-totoro-gray">
              <span className="bg-white/60 px-3 py-1 rounded-full">
                DC {result.dcRange} • {result.rarity}
              </span>
              <p className="text-xs text-totoro-gray/60 mt-2">
                {result.success ? 
                  `✅ Rolagem ${result.roll} passou no DC ${result.dc}` :
                  `❌ Rolagem ${result.roll} não passou no DC ${result.dc}`
                }
              </p>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/40">
            <h4 className="font-semibold text-totoro-gray mb-3 flex items-center text-sm">
              <span className="mr-2">🎲</span>
              Detalhes da Rolagem
            </h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <span className="bg-totoro-green/20 text-totoro-green px-2 py-1 rounded text-xs font-medium">
                  d20
                </span>
                <span className="font-bold text-lg">
                  {result.roll - result.modifier - (result.bonusDice?.value || 0)}
                </span>
              </div>
              <div className="text-totoro-gray/40">+</div>
              <div className="flex items-center space-x-2">
                <span className="bg-totoro-blue/20 text-totoro-blue px-2 py-1 rounded text-xs font-medium">
                  Mod
                </span>
                <span className="font-bold text-lg text-totoro-blue">
                  +{result.modifier}
                </span>
              </div>
              {result.bonusDice && (
                <>
                  <div className="text-totoro-gray/40">+</div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-totoro-yellow/20 text-totoro-yellow px-2 py-1 rounded text-xs font-medium">
                      d{result.bonusDice.type.substring(1)}
                    </span>
                    <span className="font-bold text-lg text-totoro-yellow">
                      +{result.bonusDice.value}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-totoro-gray">
            <div className="flex items-center">
              <span className="mr-1">🌿</span>
              <span>{ingredientsService.getRegionDisplayName(result.region)}</span>
            </div>
            <div className="w-1 h-1 bg-totoro-gray/40 rounded-full"></div>
            <div className="flex items-center">
              <span className="mr-1">⭐</span>
              <span className="capitalize">{result.rarity}</span>
            </div>
          </div>
          
          {result.success && result.ingredient && (
            <div className="mt-6 bg-gradient-to-r from-totoro-yellow/10 to-totoro-orange/10 rounded-xl p-5 border-2 border-totoro-yellow/30 shadow-lg">
              <div className="text-center mb-4">
                <div className="text-3xl mb-2">🎁</div>
                <h4 className="font-bold text-totoro-orange text-lg">
                  Ingrediente Coletado!
                </h4>
                {settingsService.getDoubleForageTalent() && (result.rarity === 'comum' || result.rarity === 'incomum') && (
                  <div className="mt-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-300/30 rounded-lg px-3 py-2">
                    <div className="text-purple-600 text-sm font-medium flex items-center justify-center">
                      <span className="mr-2">✨</span>
                      Talento Ativado: Forrageamento Duplo!
                      <span className="ml-2">✨</span>
                    </div>
                    <div className="text-purple-500 text-xs mt-1">
                      Você coletou 2x este ingrediente {result.rarity}!
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white/80 rounded-lg p-4 mb-4 border border-totoro-yellow/20">
                <h5 className="font-bold text-totoro-gray text-lg mb-2">
                  {result.ingredient.nome_portugues}
                </h5>
                <p className="text-sm text-totoro-gray leading-relaxed">
                  {result.ingredient.descricao.substring(0, 120)}...
                </p>
              </div>
              
              <div className="flex justify-center space-x-3">
                <div className="bg-totoro-orange/20 border border-totoro-orange/30 rounded-lg px-3 py-2 text-center">
                  <div className="text-totoro-orange text-xs font-medium mb-1">⚔️ Combat</div>
                  <div className="text-totoro-orange font-bold text-lg">{result.ingredient.combat}</div>
                </div>
                <div className="bg-totoro-blue/20 border border-totoro-blue/30 rounded-lg px-3 py-2 text-center">
                  <div className="text-totoro-blue text-xs font-medium mb-1">🛠️ Utility</div>
                  <div className="text-totoro-blue font-bold text-lg">{result.ingredient.utility}</div>
                </div>
                <div className="bg-totoro-yellow/20 border border-totoro-yellow/30 rounded-lg px-3 py-2 text-center">
                  <div className="text-totoro-yellow text-xs font-medium mb-1">✨ Whimsy</div>
                  <div className="text-totoro-yellow font-bold text-lg">{result.ingredient.whimsy}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ContentCard>
  );
}
