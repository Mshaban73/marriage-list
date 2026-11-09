import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Item, SavedList } from './types';
import { getTafqeet } from './services/geminiService';
import { 
  PlusCircleIcon, 
  MinusCircleIcon, 
  SpinnerIcon, 
  PrinterIcon,
  SaveIcon,
  ArchiveIcon,
  TrashIcon,
  CloseIcon
} from './components/icons';

const STORAGE_KEY = 'marriage_lists_archive';

const App: React.FC = () => {
  const [groomName, setGroomName] = useState('محمد جمال رمضان عبد الغنى');
  const [groomId, setGroomId] = useState('29912222101253');
  const [groomAddress, setGroomAddress] = useState('53 ش السيد احمد البدوى - الطالبية - الهرم - الجيزه');
  const [brideName, setBrideName] = useState('رحاب خلف عويس سعد');
  const [brideId, setBrideId] = useState('30408202301685');
  const [brideAddress, setBrideAddress] = useState('57 ش جلال الدين الحمامصى - العجوزة محافظة الجيزه');
  
  const [witness1Name, setWitness1Name] = useState('');
  const [witness2Name, setWitness2Name] = useState('');

  const [items, setItems] = useState<Item[]>([
    { id: 1, description: 'حجرة نوم كاملة + حجرة نوم أطفال + ركنة', value: 80000 },
    { id: 2, description: 'مطبخ الوميتال', value: 20000 },
    { id: 3, description: 'أدوات المطبخ متنوعة', value: 41000 },
    { id: 4, description: 'ثلاجة كريازي', value: 31000 },
    { id: 5, description: 'غسالة العربي', value: 18000 },
    { id: 6, description: 'مفروشات متنوعة', value: 75000 },
  ]);

  const [tafqeetText, setTafqeetText] = useState<string>('');
  const [isTafqeetLoading, setIsTafqeetLoading] = useState<boolean>(false);

  // Archive and Save state
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [isArchiveOpen, setIsArchiveOpen] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // Load saved lists from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedLists(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load archive from localStorage', err);
    }
  }, []);

  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [items]);

  const handleItemChange = (id: number, field: keyof Item, value: string | number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addNewItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    setItems([...items, { id: newId, description: '', value: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  const updateTafqeet = useCallback(async () => {
      if (totalValue > 0) {
          setIsTafqeetLoading(true);
          const text = await getTafqeet(totalValue);
          setTafqeetText(text);
          setIsTafqeetLoading(false);
      } else {
          setTafqeetText('فقط لا غير');
      }
  }, [totalValue]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateTafqeet();
    }, 1000); // Debounce API call

    return () => {
      clearTimeout(handler);
    };
  }, [totalValue, updateTafqeet]);

  // Save current list to archive
  const handleSaveList = () => {
    const newList: SavedList = {
      id: Date.now().toString(),
      createdAt: new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      groomName,
      groomId,
      groomAddress,
      brideName,
      brideId,
      brideAddress,
      witness1Name,
      witness2Name,
      items: JSON.parse(JSON.stringify(items)),
      totalValue,
      tafqeetText,
    };

    const updated = [newList, ...savedLists];
    setSavedLists(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    setSaveNotification('تم حفظ القائمة في الأرشيف بنجاح! ✓');
    setTimeout(() => {
      setSaveNotification(null);
    }, 3500);
  };

  // Load a saved list from archive
  const handleLoadList = (list: SavedList) => {
    setGroomName(list.groomName || '');
    setGroomId(list.groomId || '');
    setGroomAddress(list.groomAddress || '');
    setBrideName(list.brideName || '');
    setBrideId(list.brideId || '');
    setBrideAddress(list.brideAddress || '');
    setWitness1Name(list.witness1Name || '');
    setWitness2Name(list.witness2Name || '');
    setItems(list.items && list.items.length > 0 ? list.items : [{ id: 1, description: '', value: 0 }]);
    setTafqeetText(list.tafqeetText || '');
    setIsArchiveOpen(false);

    setSaveNotification(`تم استرجاع قائمة: ${list.groomName} و ${list.brideName}`);
    setTimeout(() => {
      setSaveNotification(null);
    }, 3500);
  };

  // Delete a list from archive
  const handleDeleteList = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذه القائمة من الأرشيف؟')) {
      const updated = savedLists.filter(list => list.id !== id);
      setSavedLists(updated);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage', err);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top action bar: Save, Print, Archive */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap justify-between items-center gap-3 print:hidden bg-white p-4 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-lg">قائمة المنقولات الزوجية</span>
          {saveNotification && (
            <span className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-3 py-1 rounded-full animate-fade-in">
              {saveNotification}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* 1. الحفظ */}
          <button
            onClick={handleSaveList}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm active:scale-95"
            title="حفظ القائمة الحالية"
          >
            <SaveIcon className="w-5 h-5" />
            حفظ القائمة
          </button>

          {/* 2. الطباعة */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm active:scale-95"
            title="طباعة القائمة"
          >
            <PrinterIcon className="w-5 h-5" />
            طباعة
          </button>

          {/* 3. الأرشيف */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm active:scale-95 relative"
            title="فتح الأرشيف"
          >
            <ArchiveIcon className="w-5 h-5" />
            الأرشيف
            {savedLists.length > 0 && (
              <span className="bg-amber-500 text-gray-900 font-bold text-xs px-2 py-0.5 rounded-full mr-1">
                {savedLists.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-2xl rounded-lg p-8 max-w-4xl mx-auto">
        <header className="text-center mb-8 border-b-2 pb-6 border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">بسم الله الرحمن الرحيم</h1>
          <p className="text-lg text-red-600 font-semibold">(ومن آياته أن خلق لكم من أنفسكم أزواجا لتسكنوا إليها وجعل بينكم مودة ورحمة)</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">قائمة منقولات زوجية</h2>
        </header>

        <section className="mb-8 text-base leading-relaxed text-gray-700">
            أقر أنا / <input type="text" value={groomName} onChange={e => setGroomName(e.target.value)} className="font-bold border-b-2 border-dotted px-2 mx-1"/> 
            الموقع أدناه وأحمل رقم قومي <input type="text" value={groomId} onChange={e => setGroomId(e.target.value)} className="font-bold border-b-2 border-dotted px-2 mx-1"/>
            والمقيم في <input type="text" value={groomAddress} onChange={e => setGroomAddress(e.target.value)} className="font-bold border-b-2 border-dotted px-2 mx-1 w-full sm:w-auto"/>
            أنني قد عاينت وتسلمت جميع المنقولات الخاصة بالآنسة / <input type="text" value={brideName} onChange={e => setBrideName(e.target.value)} className="font-bold border-b-2 border-dotted px-2 mx-1"/>
            والتي تحمل رقم قومي <input type="text" value={brideId} onChange={e => setBrideId(e.target.value)} className="font-bold border-b-2 border-dotted px-2 mx-1"/>
            والمقيمة في <input type="text" value={brideAddress} onChange={e => setBrideAddress(e.target.value)} className="font-bold border-b-2 border-dotted px-2 mx-1 w-full sm:w-auto"/>
            وأصبحت مسئولًا عنها من تاريخ توقيعي على هذه القائمة.
        </section>

        <section className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 w-16 text-center">م</th>
                  <th className="p-3">البيان</th>
                  <th className="p-3 w-40 text-left">القيمة (جنيه)</th>
                  <th className="p-3 w-16 text-center print:hidden"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-center align-top pt-4">{index + 1}</td>
                    <td className="p-2 align-top">
                      <textarea
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition"
                        rows={2}
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        type="number"
                        value={item.value}
                        onChange={(e) => handleItemChange(item.id, 'value', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded-md text-left focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </td>
                    <td className="p-2 text-center align-top pt-4 print:hidden">
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition" title="حذف البند">
                        <MinusCircleIcon className="w-7 h-7" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center print:hidden">
            <button onClick={addNewItem} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md">
              <PlusCircleIcon className="w-6 h-6" />
              إضافة بند جديد
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-emerald-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-emerald-700 transition shadow-md">
              <PrinterIcon className="w-6 h-6" />
              طباعة القائمة
            </button>
          </div>
        </section>

        <footer className="border-t-2 pt-6 border-gray-200">
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">الإجمالي بدون قيمة الذهب:</h3>
              <span className="text-2xl font-bold text-green-700 bg-green-100 px-4 py-1 rounded-full">
                {totalValue.toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
              </span>
            </div>
            <div className="text-center p-4 border-2 border-dashed rounded-lg">
                <p className="font-bold text-lg text-gray-800">
                    {isTafqeetLoading ? (
                        <span className="flex items-center justify-center text-gray-500"><SpinnerIcon className="w-6 h-6 mr-2" />جاري التحويل...</span>
                    ) : (
                        tafqeetText
                    )}
                </p>
            </div>
          </div>

          <div className="text-base text-gray-700 mb-12">
            استلمت أنا / <span className="font-bold">{groomName}</span> من الانسة / <span className="font-bold">{brideName}</span> المنقولات عالية وصفًا وقيمة وذلك على سبيل الأمانة وأتعهد بالمحافظة عليها وألتزم بردها عينا او دفع قيمتها نقدا متى طلب مني ذلك واذا لم اقم بردها وا دفع ثمنها اكون مبددا او خائن للامانة واتحمل المسئولية المترتبة على ذلك.
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-gray-800 signatures-section">
            <div>
              <h4 className="font-bold text-lg mb-6">المقر بما فيه (الزوج)</h4>
              <div className="flex gap-2 items-baseline mb-4">
                <span className="font-semibold">الاسم:</span>
                <input 
                  type="text" 
                  value={groomName} 
                  onChange={e => setGroomName(e.target.value)} 
                  className="flex-grow p-1 bg-transparent font-bold border-b-2 border-gray-400 border-dotted focus:outline-none focus:border-solid focus:border-blue-500 transition"
                  aria-label="اسم الزوج"
                />
              </div>
              <div className="flex gap-2 items-baseline">
                <span className="font-semibold">التوقيع:</span>
                <span className="flex-grow border-b-2 border-gray-400 border-dotted h-6"></span>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">الشهود</h4>
              <div className="mb-6">
                <div className="flex gap-2 items-baseline mb-4">
                  <span className="font-semibold">الشاهد الأول:</span>
                  <input 
                    type="text" 
                    value={witness1Name} 
                    onChange={e => setWitness1Name(e.target.value)} 
                    className="flex-grow p-1 bg-transparent font-bold border-b-2 border-gray-400 border-dotted focus:outline-none focus:border-solid focus:border-blue-500 transition"
                    aria-label="اسم الشاهد الأول"
                  />
                </div>
                <div className="flex gap-2 items-baseline">
                  <span className="font-semibold">التوقيع:</span>
                  <span className="flex-grow border-b-2 border-gray-400 border-dotted h-6"></span>
                </div>
              </div>
              <div>
                <div className="flex gap-2 items-baseline mb-4">
                  <span className="font-semibold">الشاهد الثاني:</span>
                  <input 
                    type="text" 
                    value={witness2Name} 
                    onChange={e => setWitness2Name(e.target.value)} 
                    className="flex-grow p-1 bg-transparent font-bold border-b-2 border-gray-400 border-dotted focus:outline-none focus:border-solid focus:border-blue-500 transition"
                    aria-label="اسم الشاهد الثاني"
                  />
                </div>
                <div className="flex gap-2 items-baseline">
                  <span className="font-semibold">التوقيع:</span>
                  <span className="flex-grow border-b-2 border-gray-400 border-dotted h-6"></span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Archive Modal */}
      {isArchiveOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 print:hidden backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                <ArchiveIcon className="w-6 h-6 text-gray-800" />
                <h3 className="text-xl font-bold text-gray-800">أرشيف القوائم المحفوظة</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full">
                  {savedLists.length} قائمة
                </span>
              </div>
              <button 
                onClick={() => setIsArchiveOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition"
                title="إغلاق"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {savedLists.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <ArchiveIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-semibold">لا توجد قوائم محفوظة في الأرشيف حالياً</p>
                  <p className="text-sm text-gray-400 mt-1">اضغط على زر "حفظ القائمة" لحفظ القائمة الحالية هنا</p>
                </div>
              ) : (
                savedLists.map((list) => (
                  <div 
                    key={list.id}
                    onClick={() => handleLoadList(list)}
                    className="border border-gray-200 hover:border-blue-500 hover:shadow-md p-4 rounded-xl transition cursor-pointer bg-white group flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition">
                        الزوج: {list.groomName || 'بدون اسم'} | الزوجة: {list.brideName || 'بدون اسم'}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>📅 {list.createdAt}</span>
                        <span>📦 {list.items?.length || 0} بنود</span>
                        <span className="font-bold text-green-700">
                          💰 {(list.totalValue || 0).toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleLoadList(list)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-lg transition"
                      >
                        تحميل
                      </button>
                      <button
                        onClick={(e) => handleDeleteList(list.id, e)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition"
                        title="حذف من الأرشيف"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsArchiveOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-5 rounded-lg transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
