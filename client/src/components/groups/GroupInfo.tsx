import { Group, GroupDTO } from '../../models/Group';

interface Props {
  group: GroupDTO;
}

export default function GroupInfoCard({ group }: Props) {
  const model = new Group(group);

  const formatDate = (dateStr?: string) =>
    dateStr ? dateStr.split('T')[0] : '–';

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations du groupe
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom du groupe
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.name}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Niveau
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.level}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date de début
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(model.startDate)}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Date de fin
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatDate(model.endDate)}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Heures hebdomadaires
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.weeklyHours}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Heures totales
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.totalHours}
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Prix
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.priceFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
