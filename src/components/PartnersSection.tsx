import React from 'react';

const PartnersSection: React.FC = () => {
  return (
    <section className="tdr-partners">
      <div className="tdr-partners-grid">
        <img 
          src="/images/partners/rmcl.jpg" 
          alt="Partner RMCL" 
          className="tdr-partner-logo"
        />
        {/* Add more partner logos as needed */}
      </div>
    </section>
  );
};

export default PartnersSection;
