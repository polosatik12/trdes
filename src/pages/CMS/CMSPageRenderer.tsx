import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CMSBlockRenderer from '@/components/CMSBlockRenderer';
import { cmsPublicAPI } from '@/lib/cmsApi';
import HeaderNew from '@/components/HeaderNew';
import FooterNew from '@/components/FooterNew';

const CMSPageRenderer: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    cmsPublicAPI.getPage(slug)
      .then(({ data }) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003051]" />
      </div>
    );
  }

  if (notFound) {
    return <Navigate to="/404" replace />;
  }

  if (!data || !data.blocks || data.blocks.length === 0) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNew />
      <main className="flex-1 pt-20">
        {data.blocks.map((block: any, index: number) => (
          <CMSBlockRenderer key={block.id || index} block={block} />
        ))}
      </main>
      <FooterNew />
    </div>
  );
};

export default CMSPageRenderer;
