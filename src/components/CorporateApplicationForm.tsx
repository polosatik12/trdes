import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from '@/components/ui/form';

const applicationSchema = z.object({
  company_name: z.string().trim().min(1, 'Укажите название компании').max(200),
  contact_person: z.string().trim().min(1, 'Укажите контактное лицо').max(200),
  email: z.string().trim().email('Введите корректный email').max(255),
  phone: z.string().trim().min(5, 'Введите номер телефона').max(30),

  message: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true, { errorMap: () => ({ message: 'Необходимо дать согласие' }) }),
});

type FormValues = z.infer<typeof applicationSchema>;

const CorporateApplicationForm: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',

      message: '',
      consent: undefined as unknown as true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/corporate/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      toast({
        title: 'Заявка отправлена',
        description: 'Мы свяжемся с вами в ближайшее время для обсуждения деталей.',
      });
      form.reset();
      setOpen(false);
    } catch {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заявку. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-[50px] px-10 text-base font-semibold">
          Оставить заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Заявка на участие в Корпоративной лиге</DialogTitle>
          <DialogDescription>
            Заполните форму и мы свяжемся с вами для обсуждения деталей участия.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField control={form.control} name="company_name" render={({ field }) => (
              <FormItem>
                <FormLabel>Название компании *</FormLabel>
                <FormControl><Input placeholder="ООО «Название»" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="contact_person" render={({ field }) => (
              <FormItem>
                <FormLabel>Контактное лицо *</FormLabel>
                <FormControl><Input placeholder="Иванов Иван Иванович" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl><Input type="email" placeholder="info@company.ru" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон *</FormLabel>
                  <FormControl><Input type="tel" placeholder="+7 (999) 123-45-67" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>


            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>Сообщение</FormLabel>
                <FormControl><Textarea placeholder="Дополнительная информация или пожелания..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="consent" render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                   <FormLabel className="text-xs text-muted-foreground font-normal cursor-pointer">
                     Я даю согласие на обработку персональных данных в соответствии с{' '}
                    <button
                      type="button"
                      className="underline text-primary hover:text-primary/80 bg-transparent border-none p-0 font-normal text-xs cursor-pointer"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          const res = await fetch('/documents/consent-personal-data.pdf');
                          const blob = await res.blob();
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'Согласие_на_обработку_персональных_данных.pdf';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        } catch { /* ignore */ }
                      }}
                    >
                       политикой конфиденциальности
                    </button>
                   </FormLabel>
                   <FormMessage />
                </div>
              </FormItem>
            )} />

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CorporateApplicationForm;
