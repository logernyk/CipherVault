import React from 'react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const pages = [
    { id: 'upload', name: 'Upload', icon: '📤', description: 'Upload Photos' },
    { id: 'album', name: 'Create Album', icon: '🎨', description: 'Create NFT Album' },
    { id: 'photos', name: 'My Photos', icon: '🖼️', description: 'View My Photos' },
    { id: 'browse', name: 'Browse', icon: '🌐', description: 'Browse Albums' },
  ];

  return (
    <nav className="bg-white rounded-2xl card-shadow p-2 mb-8 fade-in">
      <div className="flex flex-wrap justify-center gap-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className={`flex items-center px-6 py-4 rounded-2xl transition-all duration-300 font-semibold ${
              currentPage === page.id
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            <span className="text-xl mr-3">{page.icon}</span>
            <div className="text-left">
              <div className="font-bold">{page.name}</div>
              <div className={`text-xs ${currentPage === page.id ? 'text-blue-100' : 'text-gray-500'}`}>
                {page.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}
