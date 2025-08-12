import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Teacher, TeacherDTO } from '../../models/Teacher';
import TeacherForm, { TeacherPayload } from './TeacherForm';
import api from '../../api';
import { Modal } from '../ui/modal';

interface Props {
  teacher: TeacherDTO;
  phone: string;
  onUpdated: (t: TeacherDTO) => void;
}

export default function TeacherCard({ teacher, phone, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const model = new Teacher(teacher);

  const imageSrc = teacher.imageUrl
    ? teacher.imageUrl
    : undefined;

  const handleSubmit = async (data: TeacherPayload) => {
    try {
      const res = await api.put(`/teachers/${teacher.id}`, data);
      onUpdated(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update teacher:', err);
    }
  };

  const onCardClick = () => navigate(`/teachers/${teacher.id}`);
  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <>
      <div
        onClick={onCardClick}
        className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 flex items-center gap-6 justify-between cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={`${teacher.firstName} ${teacher.lastName}`}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-400">{teacher.firstName[0]}  {teacher.lastName[0]}</span>
              </div>
            )}
          </div>
          {/* Meta */}
          <div className="flex flex-col gap-1">
            <p className="text-lg font-semibold text-gray-800 dark:text-white/90">{model.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{phone}</p>
          </div>
        </div>
        {/* Edit Button */}
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 text-sm font-medium rounded-lg bg-white/[0.03] py-2.5 px-4 text-gray-800 dark:text-gray-200 hover:bg-white/[0.05]"
        >
          Éditer
        </button>
      </div>

      {isEditing && (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} className='max-w-[1400px]'>
          <TeacherForm
            initialData={teacher}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </>
  );
}
