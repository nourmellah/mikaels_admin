import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody
} from '../../components/ui/table';
import Badge from '../../components/ui/badge/Badge';
import api from '../../api';
import { CostDTO } from '../../models/Cost';
import { Cost } from '../../models/Cost';

export default function CostsList() {
  const navigate = useNavigate();
  const [costs, setCosts] = useState<CostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    api.get<CostDTO[]>('/costs')
      .then(res => setCosts(res.data))
      .catch(err => {
        console.error('Error fetching costs:', err);
        setError('Impossible de charger les coûts.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error)   return <div className="text-red-600">{error}</div>;

  return (
    <>
      <PageMeta
        title="Liste des coûts"
        description="Tous les coûts enregistrés"
      />
      <PageBreadcrumb pageTitle="Coûts" />

      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6 flex justify-center">
        <button
          onClick={() => navigate('/costs/add')}
          className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Ajouter un coût
        </button>
      </div>

      <ComponentCard title="Liste des coûts">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Nom
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Description
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Type
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Montant
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Fréquence
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Début
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Prochaine échéance
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Statut
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {costs.map(raw => {
                  const cost = new Cost(raw);
                  return (
                    <TableRow key={cost.id}>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        {cost.name}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        {cost.description}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        <Badge variant={cost.isFixed ? 'solid' : 'light'}>
                          {cost.type === 'fixed' ? 'Récurrent' : 'Variable'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        {cost.amountFormatted}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        {cost.frequency === 'one_time'
                          ? 'Ponctuel'
                          : cost.frequency.charAt(0).toUpperCase() + cost.frequency.slice(1)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        {cost.startDate}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        {cost.nextDueDate || '–'}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        <Badge variant="solid" color={cost.paid ? 'success' : 'error'}>
                          {cost.paid ? 'Payé' : 'Non payé'}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-gray-200 text-start">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/costs/${cost.id}/edit`)}
                            className="text-sm font-medium px-3 py-1 rounded bg-white/[0.03] hover:bg-white/[0.05]"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Supprimer ce coût ?')) {
                                api.delete(`/costs/${cost.id}`)
                                  .then(() => setCosts(cs => cs.filter(c => c.id !== cost.id)))
                                  .catch(console.error);
                              }
                            }}
                            className="text-sm font-medium px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </ComponentCard>
    </>
  );
}
