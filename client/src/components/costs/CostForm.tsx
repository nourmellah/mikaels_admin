import React, { useState, useEffect } from 'react';
import InputField from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import DatePicker from '../../components/form/date-picker';
import Switch from '../../components/form/switch/Switch';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import { CostDTO } from '../../models/Cost';
import TextArea from '../form/input/TextArea';

export interface CostPayload {
  name: string;
  description: string;
  type: string;
  amount: number;
  frequency: string;
  startDate: string;
  nextDueDate?: string;
  paid: boolean;
}

interface CostFormProps {
  initialData?: CostDTO;
  onSubmit: (data: CostPayload) => Promise<void>;
  onCancel: () => void;
}

const typeOptions = [
  { value: 'variable', label: 'Variable' },
  { value: 'fixed', label: 'Récurrent' }
];

const frequencyOptions = [
  { value: 'one_time', label: 'Ponctuel' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
  { value: 'yearly', label: 'Annuel' }
];

export default function CostForm({ initialData, onSubmit, onCancel }: CostFormProps) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [type, setType] = useState<'variable' | 'fixed'>(initialData?.type ?? 'variable');
  const [amount, setAmount] = useState(initialData?.amount.toString() ?? '0');
  const [frequency, setFrequency] = useState(initialData?.frequency ?? 'one_time');
  const [startDate, setStartDate] = useState(initialData?.startDate ?? '');
  const [nextDueDate, setNextDueDate] = useState(initialData?.nextDueDate ?? '');
  const [paid, setPaid] = useState(initialData?.paid ?? false);

  // Hide frequency & nextDueDate for variable costs
  const isVariable = type === 'variable';

  useEffect(() => {
    if (isVariable) {
      setFrequency('one_time');
      setNextDueDate('');
    }
  }, [isVariable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      type,
      amount: Number(amount),
      frequency,
      startDate,
      nextDueDate: nextDueDate || undefined,
      paid
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ComponentCard title={initialData ? 'Modifier un coût' : 'Ajouter un coût'}>
        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div className="space-y-6">
            <ComponentCard title="Détails du groupe">
              <div>
                <Label>Nom</Label>
                <InputField value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Description</Label>
                <TextArea value={description} onChange={value => setDescription(value)} rows={11}/>
              </div>
              <div>
                <Label>Type</Label>
                <Select options={typeOptions} defaultValue={type} onChange={(value: string) => setType(value as 'variable' | 'fixed')} />
              </div>
            </ComponentCard>
          </div>
          <div className='space-y-6'>
            <ComponentCard title="Détails financiers">
              <div>
                <Label>Fréquence</Label>
                <Select
                  options={frequencyOptions}
                  defaultValue={frequency}
                  onChange={(value: string) => setFrequency(value as 'one_time' | 'weekly' | 'monthly' | 'yearly')}
                  disabled={isVariable}
                />
              </div>
              <div>
                <Label>Montant</Label>
                <InputField
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Date de début</Label>
                <DatePicker
                  id="startDate"
                  defaultDate={startDate ? new Date(startDate) : undefined}
                  onChange={dates => setStartDate(dates[0]?.toISOString().slice(0, 10) ?? '')}
                />
              </div>
              <div>
                <Label>Date d'échéance</Label>
                <DatePicker
                  id="nextDueDate"
                  defaultDate={nextDueDate ? new Date(nextDueDate) : undefined}
                  onChange={dates => setNextDueDate(dates[0]?.toISOString().slice(0, 10) ?? '')}
                  disabled={isVariable}
                />
              </div>
              <div className="sm:col-span-2 flex items-center">
                <Switch defaultChecked={paid} onChange={setPaid} label={'Payé'} />
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-sm font-medium py-2.5 px-4 rounded-lg bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {initialData ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </ComponentCard>
          </div>
        </div>
      </ComponentCard>
    </form >
  );
}
