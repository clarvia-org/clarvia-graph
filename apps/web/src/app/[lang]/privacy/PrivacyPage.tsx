"use client";

import { useParams } from "next/navigation";
import { type Lang } from "@/lib/i18n";
import Header from "@/components/Header";
import { headlineStyle } from "../data";
import FooterSection from "../sections/FooterSection";
import { privacyCookiePolicy } from "./privacy-data";

export default function PrivacyPolicyPage() {
  const params = useParams();
  const rawLang = (params.lang as Lang) || "en";
  const contentLang = rawLang === "lu" ? "fr" : rawLang;
  const data = privacyCookiePolicy[contentLang];

  return (
    <>
      <Header lang={rawLang} />

      <main id="main-content" className="flex-grow w-full max-w-3xl mx-auto px-4 sm:px-6 py-16 relative z-10">
        {/* ── Title ── */}
        <h1
          className="text-4xl sm:text-5xl font-semibold tracking-tight mb-2 text-center"
          style={headlineStyle}
        >
          {data.title}
        </h1>

        <p className="text-sm font-medium text-calm-blue-400 mb-12 text-center">
          {data.lastUpdated}
        </p>

        {/* ── Policy Sections ── */}
        <div className="space-y-10 text-base leading-relaxed text-calm-blue-800">
          {data.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl font-semibold text-[#2b3a67]" style={{ fontFamily: headlineStyle.fontFamily }}>
                {section.heading}
              </h2>
              {section.body.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-calm-blue-700">
                  {paragraph}
                </p>
              ))}

              {section.table && (
                <div className="overflow-x-auto my-6 border border-calm-blue-100 rounded-xl shadow-sm bg-white/50 backdrop-blur-md">
                  <table className="min-w-full divide-y divide-calm-blue-100 text-sm">
                    <thead className="bg-calm-blue-50/50">
                      <tr>
                        {section.table.headers.map((header, hIdx) => (
                          <th
                            key={hIdx}
                            scope="col"
                            className="px-4 py-3 text-left font-semibold text-calm-blue-800"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-calm-blue-100 bg-white/20">
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-white/40 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td
                              key={cIdx}
                              className={`px-4 py-3 text-calm-blue-700 ${
                                cIdx === 0 ? "font-mono text-xs font-semibold" : ""
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      <FooterSection lang={rawLang} />
    </>
  );
}
