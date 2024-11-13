import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Play, Trophy } from 'lucide-react';

export function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-purple-600">
          MultiMaster
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Apprends les tables de multiplication en t'amusant ! Parfait pour les enfants de 6 à 12 ans.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <button
          onClick={() => navigate('/learn')}
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Apprendre</h2>
            <p className="text-gray-600 text-center">
              Étudie les tables de multiplication avec des visualisations interactives
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
              <Play className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">S'entraîner</h2>
            <p className="text-gray-600 text-center">
              Teste tes connaissances avec des exercices et des quiz amusants
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/progress')}
          className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Progrès</h2>
            <p className="text-gray-600 text-center">
              Suis tes réussites et gagne des récompenses
            </p>
          </div>
        </button>
      </div>

      <div className="mt-12 bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Pourquoi MultiMaster ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Apprentissage Interactif',
              description: 'Aides visuelles et audio pour faciliter la mémorisation',
            },
            {
              title: 'Suivi des Progrès',
              description: 'Surveille ton amélioration avec des statistiques détaillées',
            },
            {
              title: 'Récompenses Amusantes',
              description: 'Gagne des badges et des trophées en apprenant',
            },
          ].map((feature) => (
            <div key={feature.title} className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}