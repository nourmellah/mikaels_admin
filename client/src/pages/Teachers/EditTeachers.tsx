/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import InputField from '../../components/form/input/InputField';
import FileInput from '../../components/form/input/FileInput';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import PhoneInput from '../../components/form/group-input/PhoneInput';
import api from '../../api';

export default function EditTeacherPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [salary, setSalary] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = [{ code: 'TN', label: '+216' }];

  useEffect(() => {
    if (!id) return;
    api.get(`/teachers/${id}`)
      .then(res => {
        const t = res.data;
        setFirstName(t.firstName);
        setLastName(t.lastName);
        setEmail(t.email);
        setPhone(t.phone || '');
        setSalary(String(t.salary));
      })
      .catch(console.error);
  }, [id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis.';
    if (!lastName.trim()) errs.lastName = 'Le nom est requis.';
    if (!email) errs.email = 'Le courriel est requis.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Format de courriel invalide.';
    if (!salary) errs.salary = 'Le salaire est requis.';
    else if (isNaN(Number(salary)) || Number(salary) <= 0) errs.salary = 'Salaire valide requis.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    const payload = { firstName, lastName, email, phone, salary: Number(salary), imageUrl: null };
    try {
      await api.put(`/teachers/${id}`, payload);
      navigate('/teachers', { replace: true });
    } catch (err: any) {
      setErrors({ submit: err.response?.data?.message || 'Erreur lors de la modification du professeur.' });
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhone(value);
  };

  return (
    <>
      <PageMeta title="Modifier un professeur" description="Formulaire de modification d'un professeur" />
      <PageBreadcrumb pageTitle="Modifier un professeur" />
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <ComponentCard title="Informations personnelles">
              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="md:col-span-2">
                  <Label>E-mail</Label>
                  <InputField type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <Label>Téléphone</Label>
                  <PhoneInput
                    key={phone}
                    defaultValue={phone}
                    selectPosition="start"
                    countries={countries}
                    onChange={handlePhoneNumberChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Photo de profil</Label>
                  <FileInput onChange={e => setImageFile(e.target.files?.[0] || null)} />
                </div>
              </div>
            </ComponentCard>
          </div>
          <div className="space-y-6">
            <ComponentCard title="Informations professionnelles">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Salaire</Label>
                  <InputField type="number" value={salary} onChange={e => setSalary(e.target.value)} />
                  {errors.salary && <p className="text-red-600 text-sm">{errors.salary}</p>}
                </div>
              </div>
            </ComponentCard>

            {errors.submit && <p className="text-red-600 text-center">{errors.submit}</p>}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
