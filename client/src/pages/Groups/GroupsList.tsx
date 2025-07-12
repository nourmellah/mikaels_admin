/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Groups/GroupsList.tsx
import { useState, useEffect } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import api from '../../api';

interface Group {
  id: number;
  name: string;
  level: string;
  teacherId: number | null;
  startDate: string;
  endDate: string;
  weeklyHours: number;
  totalHours: number;
  price: number;
}

export default function GroupsList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachersMap, setTeachersMap] = useState<Record<number, string>>({});

  useEffect(() => {
    Promise.all([api.get('/groups'), api.get('/teachers')])
      .then(([grpRes, tchRes]) => {
        setGroups(grpRes.data);
        const map: Record<number, string> = {};
        tchRes.data.forEach((t: any) => {
          map[t.id] = `${t.firstName} ${t.lastName}`;
        });
        setTeachersMap(map);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <PageMeta
        title="Liste des groupes"
        description="Affichage de tous les groupes"
      />
      <PageBreadcrumb pageTitle="Groupes" />
      <div className="space-y-6">
        <ComponentCard title="Liste des groupes">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      Nom du groupe
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      Niveau
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      Professeur
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      Début
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      Fin
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      H. hebdo
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      H. totales
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-theme-xs font-medium text-gray-500 text-start dark:text-gray-400">
                      Prix (€)
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map(group => (
                    <TableRow
                      key={group.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    >
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {group.name}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {group.level}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {group.teacherId != null ? teachersMap[group.teacherId] : '–'}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {new Date(group.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {new Date(group.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {group.weeklyHours}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {group.totalHours}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-sm text-gray-900 dark:text-white text-start">
                        {group.price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
