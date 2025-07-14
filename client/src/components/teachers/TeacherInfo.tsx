import { Teacher, TeacherDTO } from '../../models/Teacher';

interface Props {
  teacher: TeacherDTO;
}

export default function TeacherInfo({ teacher }: Props) {
  const model = new Teacher(teacher);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Informations du professeur
          </h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Prénom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.firstName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.lastName}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                E-mail
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Téléphone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.phone || '–'}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Salaire
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {model.salaryFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
