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
}

export default function StudentCard({ student, groupName, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const model = new Student(student);

  const imageSrc = student.imageUrl
    ? student.imageUrl.startsWith('http')
      ? student.imageUrl
      : `${api.defaults.baseURL}${student.imageUrl}`
    : undefined;

  const handleSubmit = async (data: StudentPayload) => {
    try {
      const res = await api.put(`/students/${student.id}`, data);
      onUpdated(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update student:', err);
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
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {groupName} | {model.level || '–'}
            </p>
          </div>
        </div>
        {/* Edit button */}
        <button
          onClick={openEdit}
          className="flex items-center gap-2 text-sm font-medium rounded-lg bg-white/[0.03] py-2.5 px-4 text-gray-800 dark:text-gray-200 hover:bg-white/[0.05]"
        >
          Éditer
        </button>
      </div>

      {isEditing && (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} className='max-w-[1400px]'>
          <StudentForm
            initialData={student}
            onSubmit={handleSubmit}
            onCancel={() => setIsEditing(false)}
          />
        </Modal>
      )}
    </>
  );
}
