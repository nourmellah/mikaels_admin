import React, { useState } from 'react';
import { GroupDTO } from '../../models/Group';
import GroupForm, { GroupPayload } from './GroupForm';
import api from '../../api';
import { Modal } from '../ui/modal';
import { useNavigate } from 'react-router-dom';

interface Props {
  group: GroupDTO;
  professorName: string;
  level: string;
  onUpdated: (g: GroupDTO) => void;
}

export default function GroupCard({ group, professorName, level, onUpdated }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: GroupPayload) => {
    const res = await api.put(`/groups/${group.id}`, data);
    onUpdated(res.data);
    setIsEditing(false);
  };

  const onCardClick = () => navigate(`/groups/${group.id}`);
  const onEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <>
      <div
        onClick={onCardClick}
        className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Main info */}
        <div className="flex items-center gap-6">
          <h3 className="w-24 flex-shrink-0 text-lg font-semibold text-gray-800 dark:text-white/90 truncate text-center">
            {group.name}
          </h3>
          {/* Level and Professor */}
          <div className="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
            <span className="text-sm font-medium text-white bg-blue-600 py-1 px-2 rounded">
              {level}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {professorName}
            </p>
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
        <Modal isOpen onClose={() => setIsEditing(false)} className={"max-w-[1400px]"}>
            <GroupForm
              initialData={group}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
            />
        </Modal>
      )}
    </>
  );
}
