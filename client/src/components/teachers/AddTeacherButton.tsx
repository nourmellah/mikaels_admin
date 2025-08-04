import { useState, useEffect } from 'react';
import api from '../../api';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { TeacherDTO } from '../../models/Teacher';

interface AddTeacherButtonProps {
  groupId: string;
  currentTeacherId: string | null;
  onUpdated: () => void;
  variant?: 'primary' | 'outline' | undefined;
  size?: 'sm' | 'md' | undefined;
}

export default function AddTeacherButton({
  groupId,
  currentTeacherId,
  onUpdated,
  variant = 'primary',
  size = 'md'
}: AddTeacherButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teachers, setTeachers] = useState<TeacherDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentTeacherId);

  useEffect(() => {
    if (!isModalOpen) return;
    async function fetchTeachers() {
      const res = await api.get<TeacherDTO[]>('/teachers');
      setTeachers(res.data);
      setSelectedId(currentTeacherId);
    }
    fetchTeachers();
  }, [isModalOpen, currentTeacherId]);

  const handleSave = async () => {
    if (selectedId && selectedId !== currentTeacherId) {
      await api.put(`/groups/${groupId}`, { teacherId: selectedId });
    }
    setIsModalOpen(false);
    onUpdated();
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 flex items-center justify-center">
        <Button variant={variant} size={size} onClick={() => setIsModalOpen(true)}>
          Ajouter un professeur
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sélectionner un professeur
          </h3>

          <div className="max-h-80 overflow-y-auto rounded-lg p-2">
            {teachers.map(teacher => {
              const isChecked = selectedId === teacher.id;
              return (
                <label
                  key={teacher.id}
                  className={`flex items-center p-3 mb-2 rounded-md
                    ${isChecked ? 'bg-gray-200 dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'} cursor-pointer`}
                >
                  <input
                    type="radio"
                    name="teacher"
                    value={teacher.id}
                    checked={isChecked}
                    onChange={() => setSelectedId(teacher.id)}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-gray-900 dark:text-gray-100">
                    {teacher.firstName} {teacher.lastName}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <Button
              size={size}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="primary" size={size} onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
