import { useState, useEffect } from 'react';
import { Modal } from '../ui/modal';
import ComponentCard from '../common/ComponentCard';
import Label from '../form/Label';
import Select from '../form/Select';
import InputField from '../form/input/InputField';
import Button from '../ui/button/Button';
import api from '../../api';
import { GroupScheduleDTO } from '../../models/GroupSchedule';
import { GroupSessionDTO } from '../../models/GroupSession';
import { GroupDTO } from '../../models/Group';

interface Option {
  value: string;
  label: string;
}
interface ScheduleModalProps {
  schedule: Partial<GroupScheduleDTO & GroupSessionDTO> & {
    sessionId?: string;
    date?: string;
    sessionDate?: string;
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
    isMakeup?: boolean;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  onSave: (dto: GroupScheduleDTO) => Promise<void>;
  onSaveSession?: (session: GroupSessionDTO) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  onDeleteSession?: (id: string) => Promise<void>;
  onCancel: () => void;
}



export default function ScheduleModal({
  schedule,
  onSave,
  onSaveSession,
  onDelete,
  onDeleteSession,
  onCancel,
}: ScheduleModalProps) {
  const [isExtra, setIsExtra] = useState(false);
  const [groups, setGroups] = useState<Option[]>([]);
  const [groupId, setGroupId] = useState(schedule.groupId ?? '');
  const [date, setDate] = useState(schedule.sessionDate ?? schedule.date ?? '');
  const [startTime, setStartTime] = useState(schedule.startTime ?? '');
  const [endTime, setEndTime] = useState(schedule.endTime ?? '');
  const [dayOfWeek, setDayOfWeek] = useState(schedule.dayOfWeek ?? (new Date(date).getDay()));
  const [isMakeup, setIsMakeup] = useState(schedule.isMakeup ?? false);
  const [status, setStatus] = useState(schedule.status ?? 'COMPLETED');
  const [saveError, setSaveError] = useState<string | null>(null);

  // fetch groups for select
  useEffect(() => {
    async function loadGroups() {
      try {
        const res = await api.get<GroupDTO[]>('/groups');
        setGroups(res.data.map(g => ({ value: g.id, label: g.name })));
      } catch {
        // silently ignore
      }
    }
    loadGroups();
  }, []);

  useEffect(() => {
    setIsExtra(false);
    setGroupId(schedule.groupId ?? '');
    setDate(schedule.sessionDate ?? schedule.date ?? '');
    setStartTime(schedule.startTime ?? '');
    setEndTime(schedule.endTime ?? '');
    setDayOfWeek(schedule.dayOfWeek ?? (new Date(date).getDay()));
    setIsMakeup(schedule.isMakeup ?? false);
    setStatus(schedule.status ?? 'COMPLETED');
    setSaveError(null);
  }, [date, schedule]);

  const validate = () => {
    if (!groupId) return false;
    if (!date) return false;
    if (!startTime || !endTime) return false;
    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSaveError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const normalizeTime = (t: string) => {
      const [h, m] = t.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`;
    };

    try {
      if (isExtra && onSaveSession) {
        const session: GroupSessionDTO = {
          id: schedule.sessionId ?? '',
          groupId,
          sessionDate: date,
          startTime: normalizeTime(startTime),
          endTime: normalizeTime(endTime),
          isMakeup: true,
          status: 'COMPLETED',
          createdAt: schedule.createdAt ?? '',
          updatedAt: schedule.updatedAt ?? ''
        };
        await onSaveSession(session);
      } else if (schedule.sessionDate && schedule.id && onSaveSession) {
        const session: GroupSessionDTO = {
          id: schedule.id,
          groupId,
          sessionDate: date,
          startTime: normalizeTime(startTime),
          endTime: normalizeTime(endTime),
          isMakeup,
          status,
          createdAt: schedule.createdAt ?? '',
          updatedAt: schedule.updatedAt ?? ''
        };
        await onSaveSession(session);
      } else if (schedule.id && onSave) {
        const dto: GroupScheduleDTO = {
          id: schedule.id,
          groupId,
          dayOfWeek,
          startTime: normalizeTime(startTime),
          endTime: normalizeTime(endTime),
          createdAt: schedule.createdAt ?? '',
          updatedAt: schedule.updatedAt ?? ''
        };
        await onSave(dto);
      } else {
        const dto: GroupScheduleDTO = {
          id: '',
          groupId,
          dayOfWeek,
          startTime: normalizeTime(startTime),
          endTime: normalizeTime(endTime),
          createdAt: '',
          updatedAt: ''
        };
        await onSave(dto);
      }
      onCancel();
    } catch (err) {
      setSaveError('Une erreur est survenue, veuillez réessayer. ' + (err instanceof Error ? err.message : ''));
    }
  };

  const handleDelete = async () => {
    if (schedule.sessionDate && schedule.id && onDeleteSession) {
      await onDeleteSession(schedule.id);
      console.log('Session deleted:', schedule.id);
    } else if (schedule.id && onDelete) {
      await onDelete(schedule.id);
      console.log('Schedule deleted:', schedule.id);
    }
    onCancel();
  };

  return (
    <Modal isOpen onClose={onCancel} className="max-w-md">
      <div className="p-6">
        <ComponentCard
          title={
            isExtra
              ? 'Ajouter une séance de rattrapage'
              : schedule.sessionId
                ? 'Modifier la session'
                : schedule.id
                  ? 'Modifier l’horaire'
                  : 'Ajouter un horaire'
          }
        >
          <div className="space-y-4">
            <div>
              <Label>Groupe</Label>
              <Select
                options={[{ value: '', label: 'Sélectionner groupe' }, ...groups]}
                defaultValue={groupId}
                onChange={val => setGroupId(val)}
              />
              {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            </div>

            {!schedule.sessionId && (
              <div>
                <Label>Jour de la semaine</Label>
                <Select
                  options={
                    [
                      { value: '0', label: 'Dimanche' },
                      { value: '1', label: 'Lundi' },
                      { value: '2', label: 'Mardi' },
                      { value: '3', label: 'Mercredi' },
                      { value: '4', label: 'Jeudi' },
                      { value: '5', label: 'Vendredi' },
                      { value: '6', label: 'Samedi' }
                    ]
                  }
                  defaultValue={String(dayOfWeek)}
                  onChange={val => setDayOfWeek(Number(val))}
                />
              </div>
            )}

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

            <div className="flex items-center mb-4">
              <input
                id="isExtra"
                type="checkbox"
                checked={isExtra}
                onChange={e => setIsExtra(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <label htmlFor="isExtra" className="ml-2 text-gray-900 dark:text-gray-100 select-none">
                Séance de rattrapage
              </label>
            </div>

            {isExtra && (<>
              <div>
                <Label>Date de la séance</Label>
                <InputField
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  options={[
                    { value: 'COMPLETED', label: 'Terminée' },
                    { value: 'CANCELLED', label: 'Annulée' },
                    { value: 'PENDING', label: 'En attente' }
                  ]}
                  defaultValue={status}
                  onChange={val => setStatus(val as 'COMPLETED' | 'CANCELLED' | 'PENDING')}
                />
              </div></>
            )}
            <div className="flex justify-end space-x-2">
              {(schedule.sessionId || schedule.id) && (
                <Button variant="outline" onClick={handleDelete} size="sm">
                  Supprimer
                </Button>
              )}

              <Button variant="outline" onClick={onCancel} size="sm">
                Annuler
              </Button>

              <Button onClick={handleSave} size="sm">
                {schedule.sessionId || schedule.id ? 'Enregistrer' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </ComponentCard>
      </div>
    </Modal>
  );
}
