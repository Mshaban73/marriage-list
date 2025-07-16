
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Item, SavedList } from './types.ts';
import { tafqeet } from './services/tafqeetService.ts';
import { PlusCircleIcon, MinusCircleIcon, DocumentAddIcon, HistoryIcon } from './components/icons.tsx';
import SavedListsModal from './components/SavedListsModal.tsx';

const App: React.FC = () => {
  const [currentListId, setCurrentListId] = useState<string | null>(null);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const documentRef = useRef<HTMLDivElement>(null);

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
  
  const updateTafqeet = useCallback(() => {
    setTafqeetText(tafqeet(totalValue));
  }, [totalValue]);

  const handlePrint = () => {
    window.print();
  };

  const getSavedLists = (): SavedList[] => {
    const listsJSON = localStorage.getItem('movablesLists');
    return listsJSON ? JSON.parse(listsJSON) : [];
  };

  const saveCurrentList = () => {
    const savedLists = getSavedLists();
    const listToSave: SavedList = {
      id: currentListId || new Date().toISOString(),
      savedAt: new Date().toLocaleString('ar-EG'),
      groomName, groomId, groomAddress,
      brideName, brideId, brideAddress,
      witness1Name, witness2Name,
      items, totalValue,
    };

    const existingIndex = savedLists.findIndex(list => list.id === listToSave.id);
    if (existingIndex > -1) {
      savedLists[existingIndex] = listToSave;
    } else {
      savedLists.push(listToSave);
    }
    
    localStorage.setItem('movablesLists', JSON.stringify(savedLists));
    setCurrentListId(listToSave.id);
    alert('تم حفظ القائمة بنجاح!');
  };

  const handleLoadList = useCallback((listId: string) => {
    const savedLists = getSavedLists();
    const listToLoad = savedLists.find(list => list.id === listId);
    if (listToLoad) {
      setCurrentListId(listToLoad.id);
      setGroomName(listToLoad.groomName);
      setGroomId(listToLoad.groomId);
      setGroomAddress(listToLoad.groomAddress);
      setBrideName(listToLoad.brideName);
      setBrideId(listToLoad.brideId);
      setBrideAddress(listToLoad.brideAddress);
      setWitness1Name(listToLoad.witness1Name);
      setWitness2Name(listToLoad.witness2Name);
      setItems(listToLoad.items);
      setIsModalOpen(false);
    }
  }, []);

  const resetForm = useCallback(() => {
    setCurrentListId(null);
    setGroomName('');
    setGroomId('');
    setGroomAddress('');
    setBrideName('');
    setBrideId('');
    setBrideAddress('');
    setWitness1Name('');
    setWitness2Name('');
    setItems([{ id: Date.now(), description: '', value: 0 }]);
    setTafqeetText('فقط لا غير');
  }, []);

  const handleStartNew = () => {
    if (window.confirm("هل أنت متأكد أنك تريد بدء قائمة جديدة؟ سيتم مسح جميع المدخلات الحالية.")) {
      resetForm();
    }
  };

  useEffect(() => {
    updateTafqeet();
  }, [totalValue, updateTafqeet]);

  return (
    <>
      <SavedListsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoad={handleLoadList}
      />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto mb-4 flex justify-end gap-3 no-print">
          <button
              onClick={handleStartNew}
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md flex items-center gap-2"
          >
              <DocumentAddIcon className="w-5 h-5" />
              قائمة جديدة
          </button>
          <button
            onClick={saveCurrentList}
            className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition shadow-md flex items-center gap-2"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
              حفظ القائمة
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition shadow-md flex items-center gap-2"
          >
              <HistoryIcon className="w-5 h-5" />
              قوائمي المحفوظة
          </button>
          <button
              onClick={handlePrint}
              className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition shadow-md flex items-center gap-2"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              طباعة
          </button>
      </div>

      <div ref={documentRef} className="bg-white shadow-2xl rounded-lg p-8 max-w-4xl mx-auto printable-area">
        
        <header className="text-center mb-8 border-b-2 pb-6 border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">بسم الله الرحمن الرحيم</h1>
          <p className="text-lg text-red-600 font-semibold">(ومن آياته أن خلق لكم من أنفسكم أزواجا لتسكنوا إليها وجعل بينكم مودة ورحمة)</p>
          <h2 className="text-3xl font-bold text-gray-900 mt-4">قائمة منقولات زوجية</h2>
        </header>

        <section className="mb-8 text-base leading-relaxed text-gray-700">
          <div className="space-y-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                <span>أقر أنا /</span>
                <input type="text" value={groomName} onChange={e => setGroomName(e.target.value)} className="font-bold border-b-2 border-dotted px-2" style={{minWidth: '200px'}}/> 
                <span>الموقع أدناه وأحمل رقم قومي</span>
                <input type="text" value={groomId} onChange={e => setGroomId(e.target.value)} className="font-bold border-b-2 border-dotted px-2" style={{minWidth: '180px'}}/>
            </div>
             <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                <span>والمقيم في</span>
                <input type="text" value={groomAddress} onChange={e => setGroomAddress(e.target.value)} className="font-bold border-b-2 border-dotted px-2 flex-grow" style={{minWidth: '300px'}}/>
            </div>
             <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                <span>أنني قد عاينت وتسلمت جميع المنقولات الخاصة بالآنسة /</span>
                <input type="text" value={brideName} onChange={e => setBrideName(e.target.value)} className="font-bold border-b-2 border-dotted px-2" style={{minWidth: '200px'}}/>
                <span>والتي تحمل رقم قومي</span>
                <input type="text" value={brideId} onChange={e => setBrideId(e.target.value)} className="font-bold border-b-2 border-dotted px-2" style={{minWidth: '180px'}}/>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-2">
                 <span>والمقيمة في</span>
                <input type="text" value={brideAddress} onChange={e => setBrideAddress(e.target.value)} className="font-bold border-b-2 border-dotted px-2 flex-grow" style={{minWidth: '300px'}}/>
                <span>وأصبحت مسئولًا عنها من تاريخ توقيعي على هذه القائمة.</span>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 w-16 text-center">م</th>
                  <th className="p-3 text-right">البيان</th>
                  <th className="p-3 w-40 text-left">القيمة (جنيه)</th>
                  <th className="p-3 w-16 text-center no-print"></th>
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
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 transition text-right"
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
                    <td className="p-2 text-center align-top pt-4 no-print">
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                        <MinusCircleIcon className="w-7 h-7" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-start no-print">
            <button onClick={addNewItem} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow-md">
              <PlusCircleIcon className="w-6 h-6" />
              إضافة بند جديد
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
                <p className="font-bold text-lg text-gray-800 h-8 flex items-center justify-center">
                    {tafqeetText}
                </p>
            </div>
          </div>

          <div className="text-base text-gray-700 mb-12 leading-loose">
            استلمت أنا / <span className="font-bold">{groomName || '...'}</span> المقيم في <span className="font-bold">{groomAddress || '...'}</span> وأحمل رقم قومي <span className="font-bold">{groomId || '...'}</span> من الانسة / <span className="font-bold">{brideName || '...'}</span> المقيمة في <span className="font-bold">{brideAddress || '...'}</span> المنقولات عالية وصفًا وقيمة وذلك على سبيل الأمانة وأتعهد بالمحافظة عليها وألتزم بردها عينا او دفع قيمتها نقدا متى طلب مني ذلك واذا لم اقم بردها وا دفع ثمنها اكون مبددا او خائن للامانة واتحمل المسئولية المترتبة على ذلك.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-gray-800 signature-section">
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
    </div>
    </>
  );
};

export default App;