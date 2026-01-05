import React from 'react';

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12 pb-20 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Disclaimer</h1>
      
      <div className="space-y-8 text-[var(--muted-foreground)] leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-4">General Information</h2>
          <p>
            The information provided on this website is for general informational and entertainment purposes only. 
            All information on the site is provided in good faith, however we make no representation or warranty 
            of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, 
            or completeness of any information on the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">External Links</h2>
          <p>
            This website may contain links to other websites or content belonging to or originating from third parties 
            or links to websites and features in banners or other advertising. Such external links are not investigated, 
            monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Content Disclaimer</h2>
          <p>
            This website does not host any files on its server. All contents are provided by non-affiliated third parties. 
            This site does not accept responsibility for content hosted on third-party websites and does not have any 
            involvement in the downloading/uploading of movies. We only provide links to content that is already 
            available on the internet.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Copyright & DMCA</h2>
          <p>
            We respect the intellectual property rights of others. If you believe that your work has been copied in a 
            way that constitutes copyright infringement, please contact the appropriate third-party host content provider. 
            This website acts as a search engine and does not host or upload any copyrighted material.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4">Fair Use</h2>
          <p>
            This site may contain copyrighted material the use of which has not always been specifically authorized by 
            the copyright owner. We are making such material available in an effort to advance understanding of 
            cinematic arts. We believe this constitutes a "fair use" of any such copyrighted material as provided 
            for in section 107 of the US Copyright Law.
          </p>
        </section>
      </div>
    </div>
  );
}
