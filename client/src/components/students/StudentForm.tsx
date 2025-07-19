/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import InputField from '../form/input/InputField';
import Select from '../form/Select';
import Switch from '../form/switch/Switch';
import PhoneInput from '../form/group-input/PhoneInput';
import FileInput from '../form/input/FileInput';
import Label from '../form/Label';
import ComponentCard from '../common/ComponentCard';
import api from '../../api';
import { StudentDTO } from '../../models/Student';


export interface StudentPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  groupId: string | null;
  level: string | null;
  hasCv: boolean;
  imageUrl?: string | null;
}

interface Option { value: string; label: string; }

interface StudentFormProps {
  initialData?: StudentDTO;
  onSubmit: (data: StudentPayload) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export default function StudentForm({ initialData, onSubmit }: StudentFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? '');
  const [lastName, setLastName] = useState(initialData?.lastName ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [groupId, setGroupId] = useState(initialData?.groupId ? String(initialData.groupId) : '');
  const [level, setLevel] = useState(initialData?.level ?? '');
  const [hasCv, setHasCv] = useState(initialData?.hasCv ?? false);
  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [groups, setGroups] = useState<Option[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl ?? '');
  const [uploading, setUploading] = useState<boolean>(false);


  // load group options for dropdown
  useEffect(() => {
    api.get('/groups')
      .then(res => {
        const opts: Option[] = [{ value: '', label: 'Aucun groupe' }];
        res.data.forEach((g: any) => opts.push({ value: String(g.id), label: g.name }));
        setGroups(opts);
      })
      .catch(() => setGroups([{ value: '', label: 'Aucun groupe' }]));
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis.';
    if (!lastName.trim()) errs.lastName = 'Le nom est requis.';
    if (!email.trim()) errs.email = 'Le courriel est requis.';
    return errs;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageUrl(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let uploadedUrl: string | null = null;
    if (imageUrl) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageUrl);

      try {
        // POST to your Express /upload route fileciteturn2file1
        const { data } = await api.post<{ url: string }>('/upload', formData);
        uploadedUrl = data.url;
      } catch (err) {
        console.error('Image upload failed', err);
        setUploading(false);
        throw err;
      } finally {
        setUploading(false);
      }
    }

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    await onSubmit({
      firstName,
      lastName,
      email,
      phone,
      groupId: groupId || null,
      level: level || null,
      hasCv,
      imageUrl: uploadedUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ComponentCard title={initialData ? "Modifier un étudiant" : ''}>
        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div className="space-y-6">

            <ComponentCard title="Informations personnelles">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Prénom</Label>
                  <InputField id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
                </div>
                <div>
                  <Label>Nom</Label>
                  <InputField id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                  {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>E-mail</Label>
                  <InputField type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
                  {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                </div>
                {/* Phone Input with proper usage */}
                <div className="md:col-span-2">
                  <Label>Téléphone</Label>
                  <PhoneInput
                    defaultValue={phone}
                    selectPosition="start"
                    countries={[{ code: 'TN', label: '+216' }]}
                    onChange={setPhone}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Photo de profil</Label>
                  <FileInput onChange={handleFileChange} />
                  {previewUrl && (
                    <img src={previewUrl} alt="Aperçu" className="mt-2 h-24 w-24 object-cover rounded" />
                  )}
                  {uploading && <p>Uploading…</p>}
                </div>
              </div>
            </ComponentCard>
          </div>
          <div className="space-y-6">
            <ComponentCard title="Informations académiques">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Groupe</Label>
                  <Select options={groups} onChange={setGroupId} key={groupId} defaultValue={groupId} />
                  {errors.groupId && <p className="text-red-600 text-sm">{errors.groupId}</p>}
                </div>
                <div>
                  <Label>Niveau</Label>
                  <Select
                    options={[
                      { value: '0', label: '0' },
                      { value: 'A1', label: 'A1' },
                      { value: 'A2', label: 'A2' },
                      { value: 'B1', label: 'B1' },
                      { value: 'B2', label: 'B2' },
                      { value: 'C1', label: 'C1' },
                      { value: 'C2', label: 'C2' }
                    ]}
                    onChange={setLevel}
                    key={level}
                    defaultValue={level}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Switch onChange={() => setHasCv(prev => !prev)} label={'CV fourni'} key={String(hasCv)} defaultChecked={hasCv} />
                </div>
              </div>
            </ComponentCard>

            {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {initialData ? "Sauvegarder la modification" : "Ajouter l'étudiant"}
            </button>
          </div>
        </div>

      </ComponentCard>
    </form>
  );
}


