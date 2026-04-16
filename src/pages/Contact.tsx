import React, { useState, useEffect } from 'react';
import HeaderNew from '../components/HeaderNew';
import FooterNew from '../components/FooterNew';

const Contact: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    consent: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      alert('Сообщение успешно отправлено!');
      setFormData({ name: '', email: '', message: '', consent: false });
    } catch (error) {
      alert('Ошибка при отправке сообщения. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNew />

      <main className="flex-1 tdr-page">
        <div className="tdr-container text-foreground">
            
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Form */}
            <form className="tdr-form" onSubmit={handleSubmit}>
              <div className="tdr-form-group">
                <label className="tdr-form-label">
                  Имя<span className="required">*</span>
                </label>
                <input type="text"
                className="tdr-form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required />
                
              </div>
              
              <div className="tdr-form-group">
                <label className="tdr-form-label">
                  Email<span className="required">*</span>
                </label>
                <input
                  type="email"
                  className="tdr-form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required />
                
              </div>
              
              <div className="tdr-form-group">
                <label className="tdr-form-label">
                  Сообщение<span className="required">*</span>
                </label>
                <textarea
                  className="tdr-form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required />
                
              </div>
              
              <div className="tdr-form-group">
                <label className="tdr-form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    required />
                  
                  <span className="text-[14px]">
                    Я согласен на обработку{' '}
                    <a
                      href="/documents/consent-personal-data.pdf"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        fetch('/documents/consent-personal-data.pdf').
                        then((res) => res.blob()).
                        then((blob) => {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'Согласие_на_обработку_персональных_данных.pdf';
                          a.click();
                          URL.revokeObjectURL(url);
                        });
                      }}
                      className="text-primary underline hover:text-primary/80 transition-colors">
                      
                      персональных данных
                    </a>
                    <span className="text-[#c53030]">*</span>
                  </span>
                </label>
              </div>
              
              <button type="submit" className="tdr-btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'ОТПРАВКА...' : 'ОТОСЛАТЬ'}
              </button>
            </form>
            
            {/* Contact Info */}
            <div className="tdr-contact-info space-y-6">
              <div>
                <h3 className="font-bold text-foreground mb-4">Реквизиты</h3>
                <p className="font-semibold">ООО «ВЕЛОТУР»</p>
              </div>

              <div className="space-y-1 text-[14px]">
                <p className="text-foreground"><span className="text-foreground">ИНН:</span> 7811814589</p>
                <p className="text-foreground"><span className="text-foreground">ОГРН:</span> 1267800017055</p>
              </div>

              <div className="text-[14px]">
                <p className="mb-1 text-foreground">Юридический адрес:</p>
                <p className="text-foreground">192029, Санкт-Петербург, муниципальный округ Невская застава, проспект Обуховской обороны, дом 70, корпус 2, литера А, помещение 1-Н, комната №290, офис №412</p>
              </div>


              <div className="text-[14px] space-y-1">
                <p className="text-foreground"><span className="text-foreground">Email:</span> <a href="mailto:mail@tourderussie.ru" className="hover:underline">mail@tourderussie.ru</a></p>
              </div>
            </div>
          </div>
        </div>
        
      </main>
      
      <FooterNew />
    </div>);

};

export default Contact;