/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import InputField from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import DatePicker from '../../components/form/date-picker';
import api from '../../api';
import Label from '../../components/form/Label';

export default function AddGroupPage() {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [weeklyHours, setWeeklyHours] = useState('');
  const [totalHours, setTotalHours] = useState('');
  const [price, setPrice] = useState('');
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

   const levelOptions = [
    { value: 'A1', label: 'A1' }, { value: 'A2', label: 'A2' },
    { value: 'B1', label: 'B1' }, { value: 'B2', label: 'B2' },
    { value: 'C1', label: 'C1' }, { value: 'C2', label: 'C2' }
  ];

  useEffect(() => {
    api.get('/teachers')
      .then(res => setTeachers(
        [{ value: '', label: 'Aucun professeur' }]
          .concat(res.data.map((t: any) => ({ value: String(t.id), label: `${t.firstName} ${t.lastName}` })))
      ))
      .catch(() => setTeachers([{ value: '', label: 'Aucun professeur' }]));
  }, []);

  function computeEndDate(sd: string, wh: number, th: number) {
    const start = new Date(sd);
    const weeks = wh > 0 ? Math.ceil(th / wh) : 0;
    const rawEnd = new Date(start);
    rawEnd.setDate(rawEnd.getDate() + weeks * 7);
    rawEnd.setDate(rawEnd.getDate() - rawEnd.getDay());
    return rawEnd.toISOString().slice(0, 10);
  }

  const handleStartDateChange = (dates: Date[]) => {
    const dateStr = dates[0]?.toISOString().slice(0, 10) || '';
    setStartDate(dateStr);
    setErrors(prev => { const { startDate, ...rest } = prev; return rest; });
    if (dateStr && weeklyHours && totalHours) {
      setEndDate(computeEndDate(dateStr, Number(weeklyHours), Number(totalHours)));
    }
  };

  const handleWeeklyHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      setErrors(prev => ({ ...prev, weeklyHours: 'Heures hebdo positives requises.' }));
      return;
    }
    setWeeklyHours(String(num));
    setErrors(prev => { const { weeklyHours, ...rest } = prev; return rest; });
    if (startDate && totalHours) {
      setEndDate(computeEndDate(startDate, num, Number(totalHours)));
    }
  };

  const handleTotalHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    if (isNaN(num) || num <= 0) {
      setErrors(prev => ({ ...prev, totalHours: 'Heures totales positives requises.' }));
      return;
    }
    setTotalHours(String(num));
    setErrors(prev => { const { totalHours, ...rest } = prev; return rest; });
    if (startDate && weeklyHours) {
      setEndDate(computeEndDate(startDate, Number(weeklyHours), num));
    }
  };

  const handleEndDatePickerChange = (dates: Date[]) => {
    const dateObj = dates[0];
    if (!dateObj) {
      setEndDate('');
      return;
    }
    if (startDate && dateObj < new Date(startDate)) {
      setErrors(prev => ({ ...prev, endDate: 'Date de fin doit être après la date de début.' }));
      return;
    }
    const dateStr = dateObj.toISOString().slice(0, 10);
    setEndDate(dateStr);
    setErrors(prev => { const { endDate, ...rest } = prev; return rest; });
    if (startDate && totalHours) {
      const diffDays = Math.ceil((dateObj.getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.ceil(diffDays / 7) || 1;
      const wh = Math.ceil(Number(totalHours) / weeks);
      setWeeklyHours(String(wh));
      setErrors(prev => { const { weeklyHours, ...rest } = prev; return rest; });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Le nom du groupe est requis.';
    if (!level) errs.level = 'Le niveau est requis.';
    if (!startDate) errs.startDate = 'Date de début requise.';
    if (!weeklyHours || isNaN(Number(weeklyHours))) errs.weeklyHours = 'Heures hebdo valides requises.';
    if (!totalHours || isNaN(Number(totalHours))) errs.totalHours = 'Heures totales valides requises.';
    if (!price || isNaN(Number(price))) errs.price = 'Prix valide requis.';
    if (startDate && endDate && new Date(endDate) < new Date(startDate))
      errs.endDate = 'Date de fin doit être après la date de début.';
    return errs;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    try {
      await api.post('/groups', {
        name: name.trim(),
        level,
        startDate,
        endDate,
        weeklyHours: Number(weeklyHours),
        totalHours: Number(totalHours),
        price: Number(price),
        teacherId: teacherId || null
      });
      navigate('/groups', { replace: true });
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Erreur lors de la création du groupe.' });
    }
  };

  return (
    <>
      <PageMeta title="Ajouter un groupe" description="Formulaire d'ajout d'un nouveau groupe" />
      <PageBreadcrumb pageTitle="Ajouter un groupe" />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <ComponentCard title="Détails du groupe">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nom du groupe</Label>
                  <InputField value={name} onChange={e => setName(e.target.value)} />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div>
                  <Label>Niveau</Label>
                  <Select options={levelOptions} defaultValue={level} onChange={val => setLevel(val)} />
                  {errors.level && <p className="text-red-600 text-sm">{errors.level}</p>}
                </div>
                <div>
                  <Label>Date de début</Label>
                  <DatePicker id="startDate" onChange={handleStartDateChange} />
                  {errors.startDate && <p className="text-red-600 text-sm">{errors.startDate}</p>}
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <DatePicker id="endDate" onChange={handleEndDatePickerChange} />
                  {errors.endDate && <p className="text-red-600 text-sm">{errors.endDate}</p>}
                </div>
              </div>
            </ComponentCard>
          </div>

          <div className="space-y-6">
            <ComponentCard title="Paramètres additionnels">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Heures hebdomadaires</Label>
                  <InputField type="number" value={weeklyHours} onChange={handleWeeklyHoursChange} />
                  {errors.weeklyHours && <p className="text-red-600 text-sm">{errors.weeklyHours}</p>}
                </div>
                <div>
                  <Label>Heures totales</Label>
                  <InputField type="number" value={totalHours} onChange={handleTotalHoursChange} />
                  {errors.totalHours && <p className="text-red-600 text-sm">{errors.totalHours}</p>}
                </div>
                <div>
                  <Label>Prix</Label>
                  <InputField type="number" value={price} onChange={e => setPrice(e.target.value)} />
                  {errors.price && <p className="text-red-600 text-sm">{errors.price}</p>}
                </div>
                <div>
                  <Label>Professeur</Label>
                  <Select options={teachers} onChange={val => setTeacherId(val)} />
                </div>
              </div>
            </ComponentCard>

            {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
              Ajouter le groupe
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
