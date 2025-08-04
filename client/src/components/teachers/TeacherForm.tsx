/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import InputField from '../../components/form/input/InputField';
import PhoneInput from '../../components/form/group-input/PhoneInput';
import FileInput from '../../components/form/input/FileInput';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import { TeacherDTO } from '../../models/Teacher';
import api from '../../api';

export interface TeacherPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  salary: number;
  /** URL returned by the upload endpoint */
  imageUrl?: string | null;
}

interface TeacherFormProps {
  initialData?: TeacherDTO;
  onSubmit: (data: TeacherPayload) => Promise<void>;
  onCancel: () => void;
}

export default function TeacherForm({ initialData, onSubmit, onCancel }: TeacherFormProps) {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? '');
  const [lastName, setLastName] = useState(initialData?.lastName ?? '');
  const [email, setEmail] = useState(initialData?.email ?? '');
  const [phone, setPhone] = useState(initialData?.phone ?? '');
  const [salary, setSalary] = useState(
    initialData?.salary != null ? String(initialData.salary) : ''
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [imageUrl, setImageUrl] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);

  const countries = [{ code: 'TN', label: '+216' }];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageUrl(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName) errors.firstName = 'Requis';
    if (!lastName) errors.lastName = 'Requis';
    if (!phone) errors.phone = 'Requis';
    if (!salary || isNaN(Number(salary)) || Number(salary) <= 0) {
      errors.salary = 'Requis et doit être un nombre positif';
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let uploadedUrl: string | null = null;
    if (imageUrl) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', imageUrl);

      try {
        // POST to your Express /upload route :contentReference[oaicite:1]{index=1}
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


    await onSubmit({
      firstName,
      lastName,
      email,
      phone,
      salary: Number(salary),
      imageUrl: uploadedUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ComponentCard title={initialData ? 'Modifier un professeur' : 'Ajouter un professeur'}>
        <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
          <div className="space-y-6">
            <ComponentCard title="Informations personnelles">
              <div>
                <Label>Prénom</Label>
                <InputField value={firstName} onChange={e => setFirstName(e.target.value)} />
                {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
              </div>
              <div>
                <Label>Nom</Label>
                <InputField value={lastName} onChange={e => setLastName(e.target.value)} />
                {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label>E-mail</Label>
                <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} />

              </div>
              <div className="sm:col-span-2">
                <Label>Téléphone</Label>
                <PhoneInput
                  defaultValue={phone}
                  selectPosition="start"
                  countries={countries}
                  onChange={setPhone}
                />
                {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
              </div>
            </ComponentCard>
          </div>

          <div className="space-y-6">
            <ComponentCard title="Informations professionnelles">
              <div>
                <Label>Salaire par heure</Label>
                <InputField
                  type="number"
                  value={salary}
                  onChange={e => setSalary(e.target.value)}
                />
              </div>
              {errors.salary && <p className="text-red-600 text-sm">{errors.salary}</p>}
              <div className="sm:col-span-2">
                <Label>Photo de profil</Label>
                <FileInput onChange={handleFileChange} />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Aperçu de l'image"
                    className="mt-2 h-24 w-24 object-cover rounded"
                  />
                )}
                {uploading && <p>Uploading…</p>}
              </div>
              <div className="flex items-center gap-3 px-2 mt-6 justify-end">
                <button type="button" onClick={onCancel} className="text-sm font-medium py-2.5 px-4 rounded-lg bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]">
                  Annuler
                </button>
                <button type="submit" className="text-sm font-medium py-2.5 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  {initialData ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </ComponentCard>
          </div>
        </div>
      </ComponentCard>
    </form>
  );
}
