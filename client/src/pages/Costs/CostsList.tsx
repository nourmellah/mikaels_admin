/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { CostDTO } from '../../models/Cost';
import { CostTemplateDTO } from '../../models/CostTemplate';
import ComponentCard from '../../components/common/ComponentCard';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { GroupDTO } from '../../models/Group';

export default function CostsList() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<CostTemplateDTO[]>([]);
  const [costs, setCosts] = useState<CostDTO[]>([]);
  const [groups, setGroups] = useState<GroupDTO[]>([]);

  const fetchData = async () => {
    try {
      const [tmplRes, costRes, groupRes] = await Promise.all([
        api.get<CostTemplateDTO[]>('/cost-templates'),
        api.get<CostDTO[]>('/costs'),
        api.get<GroupDTO[]>('/groups'),
      ]);

      setTemplates(tmplRes.data);
      setCosts(costRes.data);
      setGroups(groupRes.data);
      console.log('Fetched data', costRes.data, tmplRes.data, groupRes.data);
    } catch (err) {
      console.error('Failed to load costs/templates', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Supprimer ce modèle récurrent ?')) return;
    try {
      await api.delete(`/cost-templates/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la suppression du modèle', err);
    }
  };

  const handleDeleteCost = async (id: string) => {
    if (!window.confirm('Supprimer ce coût ?')) return;
    try {
      await api.delete(`/costs/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la suppression du coût', err);
    }
  };

  const handleTogglePaid = async (cost: CostDTO) => {
    try {
      await api.put(`/costs/${cost.id}`, {
        paid: !cost.paid,
        paidDate: !cost.paid && !cost.paidDate
          ? new Date().toISOString().slice(0, 10)
          : cost.paidDate,
      });
      fetchData();
    } catch (err) {
      console.error('Erreur lors du changement de statut', err);
    }
  };

  const getGroupName = (id?: string) => {
    if (!id) return '—';
    const grp = groups.find(g => g.id === id);
    return grp ? grp.name : id;
  };

  return (
    <div className="space-y-6">
      {/* Add Cost Button */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6 flex justify-center">
        <button
          onClick={() => navigate('/costs/add')}
          className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Ajouter un coût
        </button>
      </div>

      {/* Recurring Templates Section */}
      <ComponentCard title="Coûts récurrents" className="p-6">
        {templates.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nom
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Fréquence
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Groupe
                  </TableCell>
                  <TableCell isHeader className="w-24 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {templates.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {t.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start capitalize">
                      {{
                        monthly: 'Mensuel',
                        yearly: 'Annuel',
                        weekly: 'Hebdomadaire',
                        daily: 'Quotidien',
                      }[t.frequency] ?? t.frequency}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {typeof t.amount === 'number' ? t.amount.toFixed(3) : t.amount}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {getGroupName(t.groupId ?? undefined)}
                    </TableCell>
                    <TableCell className="w-24 px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      <button
                        onClick={() => handleDeleteTemplate(t.id)}
                        className="text-red-500 hover:text-red-700 text-theme-xs"
                      >
                        Supprimer
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucun modèle récurrent</p>
        )}
      </ComponentCard>

      {/* Costs History Section */}
      <ComponentCard title="Historique des coûts" className="p-6">
        {costs.length > 0 ? (
          <div className="overflow-x-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nom
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Date d'échéance
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="w-24 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Groupe
                  </TableCell>
                  <TableCell isHeader className="w-24 px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {costs.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {c.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {c.dueDate ? c.dueDate.split('T')[0] : '—'}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {typeof c.amount === 'number' ? c.amount.toFixed(3) : c.amount}
                    </TableCell>
                    <TableCell className="w-24 px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      <button
                        onClick={() => handleTogglePaid(c)}
                        className={`text-${c.paid ? 'green' : 'red'}-500 hover:text-blue-700 text-theme-xs`}
                      >
                        {c.paid ? 'Payé' : 'En attente'}
                      </button>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      {getGroupName(c.groupId ?? undefined)}
                    </TableCell>
                    <TableCell className="w-24 px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                      <button
                        onClick={() => handleDeleteCost(c.id)}
                        className="text-red-500 hover:text-red-700 text-theme-xs"
                      >
                        Supprimer
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aucun coût enregistré
          </p>
        )}
      </ComponentCard>
    </div>
  );
}
