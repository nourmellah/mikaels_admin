import React, { useState } from 'react';
import { Student, StudentDTO } from '../../models/Student';
import StudentForm, { StudentPayload } from './StudentForm';
import api from '../../api';
import { Modal } from '../ui/modal';
import { useNavigate } from 'react-router-dom';

interface Props {
  student: StudentDTO;
  groupName: string;
  onUpdated: (s: StudentDTO) => void;
  paymentsTotal?: number;
  paymentsDue?: number;
  registrationId?: string;
}

export default function StudentCard({
  student,
  groupName,
  onUpdated,
  paymentsTotal = 0,
  paymentsDue = 0,
  registrationId,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const model = new Student(student);

  const originalGroup = student.groupId;

  const imageSrc = student.imageUrl
    ? student.imageUrl.startsWith('http')
      ? student.imageUrl
      : `${api.defaults.baseURL}${student.imageUrl}`
    : undefined;

  const handleEditSubmit = async (data: StudentPayload) => {
    try {
      const res = await api.put(`/students/${student.id}`, data);
      onUpdated(res.data);
      setIsEditing(false);

      if (data.groupId && data.groupId !== originalGroup) {
        const grp = await api.get(`/groups/${data.groupId}`);
        const agreedPrice = grp.data.price;
        const today = new Date().toISOString().split('T')[0];

        await api.post('/registrations', {
          studentId: student.id,
          groupId: data.groupId,
          agreedPrice,
          depositPct: 50,
          discountAmount: 0,
          registrationDate: today,
          status: 'active',
        });
      }
    } catch (err) {
      console.error('Échec mise à jour étudiant/inscription', err);
    }
  };

  const openEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <>
      <div
        onClick={() => navigate(`/students/${student.id}`)}
        className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 flex items-center gap-6 justify-between cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            {imageSrc ? (
              <img
                src={imageSrc}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{student.firstName[0]}  {student.lastName[0]}</span>
            )}
          </div>
          {/* User meta */}
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {model.fullName}
            </p>
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {groupName} | {model.level || '–'}
              </p>
              {registrationId && (<p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                Paiements: {paymentsTotal.toFixed(2)} TND payés / {paymentsDue.toFixed(2)} TND restants
              </p>)}
            </div>
          </div>
        </div>
        {/* Edit and add‐payment buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={openEdit}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white/[0.03] text-gray-800 dark:text-gray-200 hover:bg-white/[0.05]"
          >
            Éditer
          </button>
          {registrationId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/payments/new?registration=${registrationId}`);
              }}
              className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              Ajouter paiement
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} className='max-w-[1400px]'>
          <StudentForm
            initialData={student}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </>
  );
}
