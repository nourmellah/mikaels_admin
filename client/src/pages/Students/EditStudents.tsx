/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import api from '../../api';
import InputField from '../../components/form/input/InputField';
import FileInput from '../../components/form/input/FileInput';
import Label from '../../components/form/Label';
import ComponentCard from '../../components/common/ComponentCard';
import Switch from '../../components/form/switch/Switch';
import PhoneInput from '../../components/form/group-input/PhoneInput';
import Select from '../../components/form/Select';

export default function EditStudentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupId, setGroupId] = useState('');
  const [level, setLevel] = useState('');
  const [hasCv, setHasCv] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [groups, setGroups] = useState<{ value: string; label: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const countries = [{ code: 'TN', label: '+216' }];

  // fetch all groups for dropdown
  useEffect(() => {
    api.get('/groups')
      .then(res => {
        setGroups([
          { value: '', label: 'Aucun groupe' },
          ...res.data.map((g: any) => ({ value: String(g.id), label: g.name }))
        ]);
      })
      .catch(console.error);
  }, []);

  // fetch student data
  useEffect(() => {
    if (!id) return;
    api.get(`/students/${id}`)
      .then(res => {
        const s = res.data;
        setFirstName(s.firstName);
        setLastName(s.lastName);
        setEmail(s.email);
        setPhone(s.phone || '99 999 999');
        setGroupId(s.groupId ? String(s.groupId) : '');
        setLevel(s.level || '');
        setHasCv(s.hasCv);
        // imageFile is not loaded; if you have an imageUrl field you could store it separately
      })
      .catch(console.error);
  }, [id]);

  const handlePhoneNumberChange = (phoneNumber: string) => {
    setPhone(phoneNumber);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis.';
    if (!lastName.trim()) errs.lastName = 'Le nom est requis.';
    if (!email) errs.email = 'Le courriel est requis.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = 'Format de courriel invalide.';
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

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      groupId: groupId || null,
      level: level || null,
      hasCv
    };

    try {
      await api.put(`/students/${id}`, payload);
      navigate('/students', { replace: true });
    } catch (err: any) {
      console.error('Update student error:', err);
      setErrors({
        submit: err.response?.data?.message ||
          'Une erreur est survenue, veuillez réessayer.'
      });
    }
  };

  return (
    <>
      <PageMeta
        title="Modifier un étudiant"
        description="Formulaire de modification des informations d'un étudiant"
      />
      <PageBreadcrumb pageTitle="Modifier un étudiant" />

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Personal Info */}
          <div className="space-y-6">
            <ComponentCard title="Informations personnelles">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Prénom</Label>
                  <InputField
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label>Nom</Label>
                  <InputField
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm">{errors.lastName}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>E-mail</Label>
                  <InputField
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm">{errors.email}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <Label>Téléphone</Label>
                  <PhoneInput
                    selectPosition="start"
                    countries={countries}
                    placeholder="+216 99 999 999"
                    onChange={handlePhoneNumberChange}
                    defaultValue={phone}
                    key={phone}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Photo de profil</Label>
                  <FileInput
                    onChange={e =>
                      setImageFile(
                        e.target.files && e.target.files[0]
                          ? e.target.files[0]
                          : null
                      )
                    }
                  />
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Academic Info */}
          <div className="space-y-6">
            <ComponentCard title="Informations académiques">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Groupe</Label>
                  <Select options={groups} onChange={setGroupId} key={groupId} defaultValue={groupId}/>
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
                    defaultValue={level}
                    onChange={setLevel}
                    key={level}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Switch
                    onChange={() => setHasCv(prev => !prev)}
                    label="CV fourni"
                    defaultChecked={hasCv}
                    key={String(hasCv)}
                  />
                </div>
              </div>
            </ComponentCard>

            {errors.submit && (
              <p className="text-red-600 text-center">{errors.submit}</p>
            )}

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
