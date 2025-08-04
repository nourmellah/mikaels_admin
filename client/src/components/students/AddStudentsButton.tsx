import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Modal } from '../ui/modal';
import Button from '../ui/button/Button';
import { StudentDTO } from '../../models/Student';
import { RegistrationDTO } from '../../models/Registration';

interface AddStudentsButtonProps {
  groupId: string;
  groupPrice: number;
  onUpdated: () => void;
  variant?: 'primary' | 'outline' | undefined;
  size?: 'sm' | 'md' | undefined;
}

export default function AddStudentsButton({
  groupId,
  groupPrice,
  onUpdated,
  variant = 'primary',
  size = 'md'
}: AddStudentsButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationDTO[]>([]);
  const [originalSelected, setOriginalSelected] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      // fetch all students
      const studRes = await api.get<StudentDTO[]>('/students');
      const allStudents = studRes.data;

      // fetch registrations for this group for deletion mapping
      const regRes = await api.get<RegistrationDTO[]>(
        `/registrations?group_id=${groupId}`
      );
      const groupRegs = regRes.data;

      setStudents(allStudents);
      setRegistrations(groupRegs);

      // determine initial selection: students whose student.groupId === this group
      const origSet = new Set(
        allStudents
          .filter(s => String(s.groupId) === groupId)
          .map(s => s.id)
      );
      setOriginalSelected(origSet);
      setSelectedIds(Array.from(origSet));
    }

    if (isModalOpen) {
      fetchData();
    }
  }, [isModalOpen, groupId]);

  const toggleId = (id: string) => {
    setSelectedIds(prev => {
      const exists = prev.includes(id);
      if (exists) {
        return prev.filter(i => i !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSave = async () => {
    const newSet = new Set(selectedIds);

    // compute adds and removes
    const toAdd = Array.from(newSet).filter(i => !originalSelected.has(i));
    const toRemove = Array.from(originalSelected).filter(i => !newSet.has(i));

    const addPromises = toAdd.map(async studentId => {
      const hasReg = registrations.some(r => r.studentId === studentId);
      if (!hasReg) {
        await api.post('/registrations', {
          studentId,
          groupId,
          agreedPrice: groupPrice
        });
      }
      await api.put(`/students/${studentId}`, { groupId });
    });

    // Process removals: set student.groupId to null
    const removePromises = toRemove.map(studentId =>
      api.put(`/students/${studentId}`, { groupId: null })
    );

    await Promise.all([...addPromises, ...removePromises]);
    setIsModalOpen(false);
    onUpdated();
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} variant={variant} size={size}>
        Ajouter des étudiants
      </Button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Sélectionner des étudiants
          </h3>

          <div className="max-h-80 overflow-y-auto rounded-lg p-2">
            {students.map(student => {
              const isInThis = originalSelected.has(student.id);
              const isDisabled =
                student.groupId != null && String(student.groupId) !== groupId;
              const isChecked = selectedIds.includes(student.id);

              return (
                <label
                  key={student.id}
                  className={`flex items-center p-3 mb-2 rounded-md
                    ${isDisabled ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'}`}
                >
                  <input
                    type="checkbox"
                    disabled={isDisabled}
                    checked={isChecked}
                    defaultChecked={isInThis}
                    onChange={() => toggleId(student.id)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-gray-900 dark:text-gray-100">
                    {student.firstName} {student.lastName}
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
            <Button onClick={handleSave} variant="primary" size={size}>
              Enregistrer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
