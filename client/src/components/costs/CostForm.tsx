/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import InputField from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import DatePicker from '../../components/form/date-picker';
import Switch from '../../components/form/switch/Switch';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import TextArea from '../../components/form/input/TextArea';
import { CostDTO } from '../../models/Cost';
import { FormEvent, useEffect, useState } from 'react';
import api from '../../api';

export type Mode = 'single' | 'recurring';
export interface CostPayload {
  costTemplateId?: string;
  groupId?: string;
  name: string;
  dueDate?: string;
  amount: number;
  paid?: boolean;
  paidDate?: string;
  notes?: string;
}
export interface TemplatePayload {
  groupId?: string;
  name: string;
  frequency: string;
  amount: number;
  notes?: string;
  startDate?: string;
}
interface Props {
  initialCost?: CostDTO;
  // Accept any returned DTO so handlers match actual data
  onSubmit: (data: CostDTO | any, mode: Mode) => void;
  onCancel: () => void;
}

export default function CostForm({ initialCost, onSubmit, onCancel }: Props) {
  const [mode, setMode] = useState<Mode>('single');

  // Shared fields
  const [name, setName] = useState(initialCost?.name || '');
  const [amount, setAmount] = useState(initialCost?.amount || 0);
  const [notes, setNotes] = useState(initialCost?.notes || '');
  const [groups, setGroups] = useState<{ id: string; name: string; }[]>([]);
  const [groupId, setGroupId] = useState(initialCost?.groupId || '');
  const [errors, setErrors] = useState<Record<string, string>>({});


  // Single cost fields
  const [dueDate, setDueDate] = useState(initialCost?.dueDate || '');
  const [paid, setPaid] = useState(initialCost?.paid || false);
  const [paidDate, setPaidDate] = useState(initialCost?.paidDate || '');

  // Recurring (template) fields
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    api.get('/groups')
      .then(res => setGroups(res.data))
      .catch(err => console.error('Failed to load groups', err));
  }, []);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!name) errors.name = 'Requis';
    if (!amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'Requis et doit être un nombre positif';
    }
    return errors;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mode === 'single') {
      // Prepare single cost payload with explicit nullable fields
      const payload: CostPayload = {
        name,
        amount,
        paid,
        groupId: groupId || undefined,
        dueDate: dueDate || new Date().toISOString(),
        paidDate: paid ? paidDate || new Date().toISOString() : undefined,
        notes: notes || undefined,
      };
      const { data } = await api.post<CostDTO>('/costs', payload);
      onSubmit(data, mode);
    } else {
      // Prepare recurring template payload
      const payload: TemplatePayload = {
        name,
        frequency,
        amount,
        groupId: groupId || undefined,
        startDate: startDate || undefined,
        notes: notes || undefined,
      };
      const { data } = await api.post('/cost-templates', payload);
      onSubmit(data, mode);
    }

    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ComponentCard title='Ajouter un coût' className="p-6">
        <div className="flex items-center space-x-4">
          <Label>Type de coût</Label>
          <Select
            options={[
              { label: 'Coût unique', value: 'single' },
              { label: 'Coût récurrent', value: 'recurring' }
            ]}
            defaultValue={mode}
            onChange={(value: string) => setMode(value as Mode)}
            className="max-w-xs"
          />
        </div>

        <ComponentCard title={mode === 'single' ? 'Coût unique' : 'Modèle récurrent'}>
          <Label>Nom <span className="text-red-500">*</span></Label>
          <InputField
            value={name}
            onChange={e => setName(e.target.value)}
          />
          {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}

          <Label>Montant <span className="text-red-500">*</span></Label>
          <InputField
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />
          {errors.amount && <p className="text-red-600 text-sm">{errors.amount}</p>}
          <Label>Notes</Label>
          <TextArea
            value={notes}
            onChange={value => setNotes(value)}
          />

          <Label>Groupe</Label>
          <Select
            options={[
              { label: 'Aucun groupe', value: '' },
              ...groups.map(g => ({ label: g.name, value: g.id }))
            ]}
            defaultValue={groupId}
            onChange={value => setGroupId(value)}
            className="max-w-xs mb-4"
          />


          {mode === 'single' ? (
            <>
              <Label>Date d'échéance</Label>
              <DatePicker
                id="dueDate"
                defaultDate={dueDate ? new Date(dueDate) : undefined}
                onChange={dates => setDueDate(dates[0]?.toISOString().slice(0, 10) ?? '')}
              />

              <div className="flex items-center space-x-3">
                <Switch defaultChecked={paid} onChange={setPaid} label="Paiement effectué" />
              </div>

              {paid && (
                <>
                  <Label>Date de paiement</Label>
                  <DatePicker
                    id="paidDate"
                    defaultDate={paidDate ? new Date(paidDate) : undefined}
                    onChange={dates => setPaidDate(dates[0]?.toISOString().slice(0, 10) ?? '')}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Label>Fréquence <span className="text-red-500">*</span></Label>
              <Select
                options={[
                  { label: 'Quotidien', value: 'daily' },
                  { label: 'Hebdomadaire', value: 'weekly' },
                  { label: 'Mensuel', value: 'monthly' },
                  { label: 'Annuel', value: 'yearly' }
                ]}
                defaultValue={frequency}
                onChange={value => setFrequency(value as string)}
              />
              <Label>Date de début</Label>
              <DatePicker
                id="templateStartDate"
                defaultDate={startDate ? new Date(startDate) : undefined}
                onChange={dates => setStartDate(dates[0]?.toISOString().slice(0, 10) ?? '')}
              />
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm font-medium py-2.5 px-4 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              {mode === 'single' ? 'Ajouter coût' : 'Ajouter modèle'}
            </button>
          </div>
        </ComponentCard>
      </ComponentCard>
    </form>
  );
};
