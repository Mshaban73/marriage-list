
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Item } from './types';
import { getTafqeet } from './services/geminiService';
import { PlusCircleIcon, MinusCircleIcon, SpinnerIcon } from './components/icons';

const App: React.FC = () => {
  const [groomName, setGroomName] = useState('');
  const [groomId, setGroomId] = useState('');
  const [groomAddress, setGroomAddress] = useState('');
  const [brideName, setBrideName] = useState('');
  const [brideId, setBrideId] = useState('');
  const [brideAddress, setBrideAddress] = useState('');
  
  const [witness1Name, setWitness1Name] = useState('');
  const [witness2Name, setWitness2Name] = useState('');

  const [items, setItems] = useState<Item[]>([]);

  const [tafqeetText, setTafqeetText] = useState<string>('');
  const [isTafqeetLoading, setIsTafqeetLoading] = useState<boolean>(false);

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

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
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
                  <th className="p-3 w-16 text-center"></th>
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
                        placeholder="اكتب وصف البند هنا..."
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input
                        type="number"
                        value={item.value}
                        onChange={(e) => handleItemChange(item.id, 'value', parseInt(e.target.value) || 0)}
                        className="w-full p-2 border rounded-md text-left focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-2 text-center align-top pt-4">
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 transition">
                        <MinusCircleIcon className="w-7 h-7" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-start">
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
            استلمت أنا / <span className="font-bold">{groomName || '..............................'}</span> من الانسة / <span className="font-bold">{brideName || '..............................'}</span> المنقولات عالية وصفًا وقيمة وذلك على سبيل الأمانة وأتعهد بالمحافظة عليها وألتزم بردها عينا او دفع قيمتها نقدا متى طلب مني ذلك واذا لم اقم بردها وا دفع ثمنها اكون مبددا او خائن للامانة واتحمل المسئولية المترتبة على ذلك.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-gray-800">
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
  );
};

export default App;
