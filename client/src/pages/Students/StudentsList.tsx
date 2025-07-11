/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Students/StudentsList.tsx
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
import Badge from '../../components/ui/badge/Badge';
import api from '../../api';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  groupId: number | null;
  level: string | null;
  hasCv: boolean;
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groupsMap, setGroupsMap] = useState<Record<number, string>>({});

  useEffect(() => {
    Promise.all([api.get('/students'), api.get('/groups')])
      .then(([studRes, grpRes]) => {
        setStudents(studRes.data);
        const map: Record<number, string> = {};
        grpRes.data.forEach((g: any) => (map[g.id] = g.name));
        setGroupsMap(map);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <PageMeta title="Liste des étudiants" description="Affichage de tous les étudiants" />
      <PageBreadcrumb pageTitle="Étudiants" />
      <div className="space-y-6">
        <ComponentCard title="Liste des étudiants">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Nom complet
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Courriel
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Téléphone
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Groupe
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Niveau
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      CV fourni
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => (
                    <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.05]">
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm">
                        {student.email}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm">
                        {student.phone || '-'}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm">
                        {student.groupId != null ? groupsMap[student.groupId] || 'Sans groupe' : 'Sans groupe'}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm">
                        {student.level || '-'}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-900 dark:text-white text-start text-sm">
                        {student.hasCv ? (
                          <Badge color="success">Oui</Badge>
                        ) : (
                          <Badge color="error">Non</Badge>
                        )}
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
