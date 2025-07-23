/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';
import InputField from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import api from '../../api';
import { GroupSchedule } from '../../models/GroupSchedule';
import ComponentCard from '../common/ComponentCard';

interface ScheduleModalProps {
  /** The schedule to edit, or a new GroupSchedule instance */
  schedule: GroupSchedule;
  /** Called when saving with the updated schedule */
  onSave: (schedule: GroupSchedule) => Promise<void>;
  /** Called when deleting; only for existing schedules */
  onDelete?: (id: string) => Promise<void>;
  /** Close without changes */
  onCancel: () => void;
  className?: string;
}

interface Option { value: string; label: string; }

export default function ScheduleModal({ schedule, onSave, onDelete, onCancel, className }: ScheduleModalProps) {
  const [groupId, setGroupId] = useState(schedule.groupId);
  const [dayOfWeek, setDayOfWeek] = useState<number>(schedule.dayOfWeek);
  const [startTime, setStartTime] = useState(schedule.startTime.substr(0, 5));
  const [endTime, setEndTime] = useState(schedule.endTime.substr(0, 5));
  const [groups, setGroups] = useState<Option[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // load groups for selection
  useEffect(() => {
    api.get('/groups')
      .then(res => setGroups(res.data.map((g: any) => ({ value: g.id, label: g.name }))))
      .catch(() => { });
  }, []);

  const dayOptions: Option[] = [
    { value: '0', label: 'Dimanche' },
    { value: '1', label: 'Lundi' },
    { value: '2', label: 'Mardi' },
    { value: '3', label: 'Mercredi' },
    { value: '4', label: 'Jeudi' },
    { value: '5', label: 'Vendredi' },
    { value: '6', label: 'Samedi' },
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!groupId) errs.groupId = 'Requis';
    if (startTime >= endTime) errs.time = 'Heure de fin doit être après heure de début';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    // update schedule instance
    const dto = new GroupSchedule({
      id: schedule.id,
      groupId,
      dayOfWeek,
      startTime: `${startTime}:00`,
      endTime: `${endTime}:00`,
      createdAt: schedule.createdAt.toISOString(),
      updatedAt: schedule.updatedAt.toISOString(),
    });
    await onSave(dto);
  };

  const handleDelete = async () => {
    if (schedule.id && onDelete) {
      await onDelete(schedule.id);
    }
  };

  return (
    <Modal isOpen onClose={onCancel} className={className}>
      <div className="p-6">
        <ComponentCard title={schedule.id ? 'Modifier le créneau' : 'Ajouter un créneau'}>
          <div className="space-y-4">
            <div>
              <Label>Groupe</Label>
              <Select
                options={[{ value: '', label: 'Sélectionner groupe' }, ...groups]}
                defaultValue={groupId}
                onChange={val => setGroupId(val)}
              />
              {errors.groupId && <p className="text-red-600 text-sm">{errors.groupId}</p>}
            </div>

            <div>
              <Label>Jour de la semaine</Label>
              <Select
                options={dayOptions}
                defaultValue={String(dayOfWeek)}
                onChange={val => setDayOfWeek(Number(val))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heure de début</Label>
                <InputField
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                />
              </div>
              <div>
                <Label>Heure de fin</Label>
                <InputField
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                />
              </div>
            </div>
            {errors.time && <p className="text-red-600 text-sm">{errors.time}</p>}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            {schedule.id && onDelete && (
              <Button variant="primary" onClick={handleDelete}>
                Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Valider
            </Button>
          </div>
        </ComponentCard>
      </div>
    </Modal>
  );
}
