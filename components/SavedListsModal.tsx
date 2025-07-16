
import React, { useState, useEffect, useCallback } from 'react';
import { SavedList } from '../types.ts';
import { TrashIcon } from './icons.tsx';

interface SavedListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (listId: string) => void;
}

const SavedListsModal: React.FC<SavedListsModalProps> = ({ isOpen, onClose, onLoad }) => {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);

  const fetchLists = useCallback(() => {
    const listsJSON = localStorage.getItem('movablesLists');
    const lists = listsJSON ? JSON.parse(listsJSON) : [];
    // Sort by date, newest first
    lists.sort((a: SavedList, b: SavedList) => new Date(b.id).getTime() - new Date(a.id).getTime());
    setSavedLists(lists);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, fetchLists]);

  const handleDelete = (listId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القائمة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      const updatedLists = savedLists.filter(list => list.id !== listId);
      localStorage.setItem('movablesLists', JSON.stringify(updatedLists));
      setSavedLists(updatedLists);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 no-print"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">القوائم المحفوظة</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
        </header>
        <main className="p-6 overflow-y-auto">
          {savedLists.length === 0 ? (
            <p className="text-center text-gray-500 py-8">لا توجد قوائم محفوظة حتى الآن.</p>
          ) : (
            <ul className="space-y-4">
              {savedLists.map(list => (
                <li key={list.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50 transition">
                  <div className="flex-grow">
                    <p className="font-bold text-blue-700">قائمة لـ: {list.groomName || 'غير مسمى'}</p>
                    <p className="text-sm text-gray-600">
                        تاريخ الحفظ: {new Date(list.id).toLocaleString('ar-EG')}
                    </p>
                     <p className="text-sm font-semibold text-gray-800 mt-1">
                        الإجمالي: {list.totalValue.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                    </p>
                  </div>
                  <div className="flex gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onLoad(list.id)}
                      className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      تحميل
                    </button>
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition"
                      aria-label="حذف القائمة"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
};

export default SavedListsModal;