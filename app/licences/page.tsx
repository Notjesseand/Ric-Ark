import Image from "next/image";
import Nav from "@/components/fixedNav";
import Nav1 from "@/components/nav1";
import "@/styles/star-background.css"; // Removed duplicate import
import Footer from "@/components/home/footer";

const licenses = [
  {
    country: "United States",
    region: "",
    agency: "U.S. Financial Crimes Enforcement Network",
    license: "Money Service Business Registration",
    reference: "31000201469839",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.fincen.gov",
    img: "/licences/logo-financial-crimes-enforcement-network.png",
  },
  {
    country: "United States",
    region: "Alabama",
    agency: "State Banking Department",
    license: "Consumer Credit License",
    reference: "MC 22385",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.banking.alabama.gov",
    img: "/licences/logo-alabama.png",
  },
  {
    country: "United States",
    region: "Alabama",
    agency: "Alabama Securities Commission",
    license: "Money Transmitter License",
    reference: "# 769",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.asc.alabama.gov",
    img: "/licences/logo-alabama-security-commission.png",
  },
  {
    country: "United States",
    region: "Arizona",
    agency: "Department of Insurance and Financial Institutions",
    license: "Money Transmitter License",
    reference: "MT-1034818",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://difi.az.gov",
    img: "/licences/logo-arizona.png",
  },
  {
    country: "United States",
    region: "Arizona",
    agency: "Department of Insurance and Financial Institutions",
    license: "Consumer Lender License",
    reference: "CL-1017838",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://difi.az.gov",
    img: "/licences/logo-arizona.png",
  },
  {
    country: "United States",
    region: "Arkansas",
    agency: "Arkansas Securities Department",
    license: "Money Transmitter License",
    reference: "125678",
    company: "Alpha Trade Gain Financial LLC",
    url: "http://securities.arkansas.gov",
    img: "/licences/logo-arkansas.png",
  },
  {
    country: "United States",
    region: "California",
    agency: "Department of Financial Protection and Innovation",
    license: "Financing Law License",
    reference: "60DBQ-119812",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dfpi.ca.gov",
    img: "/licences/logo-dfpi.png",
  },
  {
    country: "United States",
    region: "District of Columbia",
    agency: "Department of Insurance, Securities and Banking",
    license: "Money Lender License",
    reference: "ML 1898544",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://disb.dc.gov",
    img: "/licences/logo-dc-gov.png",
  },
  {
    country: "United States",
    region: "Delaware",
    agency: "Office of the State Bank Commissioner",
    license: "Lender License",
    reference: "035538",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://banking.delaware.gov",
    img: "/licences/logo-delaware.png",
  },
  {
    country: "United States",
    region: "Georgia",
    agency: "Department of Banking and Finance",
    license: "Seller of Payment Instruments License",
    reference: "1799753",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dbf.georgia.gov",
    img: "/licences/logo-georgia.png",
  },
  {
    country: "United States",
    region: "Idaho",
    agency: "Department of Finance",
    license: "Regulated Lender License",
    reference: "RRL-11385",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.finance.idaho.gov",
    img: "/licences/logo-idaho.svg",
  },
  {
    country: "United States",
    region: "Illinois",
    agency: "Department of Financial and Professional Regulation",
    license: "Consumer Installment Loan License",
    reference: "CI.0014461-H",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://idfpr.com",

    img: "/licences/logo-idfpr.png",
  },
  {
    country: "United States",
    region: "Iowa",
    agency: "Iowa Division of Banking",
    license: "Money Service License",
    reference: "2022-0009",
    company: "Alpha Trade Gain Financial LLC",
    url: "http://www.idob.state.ia.us",
    img: "/licences/logo-idob.png",
  },
  {
    country: "United States",
    region: "Kansas",
    agency: "Office of the State Bank Commissioner",
    license: "Supervised Loan License",
    reference: "SL.0026405",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://osbckansas.org",
    img: "/licences/logo-kansas.png",
  },
  {
    country: "United States",
    region: "Maryland",
    agency: "Commissioner of Financial Regulation",
    license: "Installment Loan License",
    reference: "03-1898745",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.maryland.gov",
    img: "/licences/logo-maryland-gov.png",
  },
  {
    country: "United States",
    region: "Maryland",
    agency: "Commissioner of Financial Regulation",
    license: "Money Transmitter License",
    reference: "1898755",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.maryland.gov",
    img: "/licences/logo-maryland-gov.png",
  },
  {
    country: "United States",
    region: "Minnesota",
    agency: "Department of Commerce",
    license: "Regulated Loan Company License",
    reference: "MN-RL-1996754",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://mn.gov/commerce/",
    img: "/licences/logo-department-of-commerce.png",
  },
  {
    country: "United States",
    region: "Minnesota",
    agency: "Department of Commerce",
    license: "Money Transmitter License",
    reference: "MN-MT-1848786",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://mn.gov/commerce/",
    img: "/licences/logo-department-of-commerce.png",
  },
  {
    country: "United States",
    region: "Mississippi",
    agency: "Department of Banking and Consumer Finance",
    license: "Money Transmitter License",
    reference: "1898643",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dbcf.ms.gov",
    img: "/licences/logo-mississippi.png",
  },
  {
    country: "United States",
    region: "Missouri",
    agency: "Division of Finance",
    license: "Sale of Checks & Money Transmitter License",
    reference: "MO-23-8913",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://finance.mo.gov",
    img: "/licences/logo-missouri-df.png",
  },
  {
    country: "United States",
    region: "Montana",
    agency: "Division of Banking and Financial Institutions",
    license: "Consumer Loan License",
    reference: "1877754",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://banking.mt.gov",
    img: "/licences/mda240x240.jpg",
  },
  {
    country: "United States",
    region: "New Hampshire",
    agency: "Banking Department",
    license: "Small Loan Lender License",
    reference: "23521-SM",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.nh.gov/banking",
    img: "/licences/logo-new-hampshire-bd.png",
  },
  {
    country: "United States",
    region: "New Hampshire",
    agency: "Banking Department",
    license: "Money Transmitter License",
    reference: "24189-MT",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.nh.gov/banking",
    img: "/licences/logo-new-hampshire-bd.png",
  },
  {
    country: "United States",
    region: "North Dakota",
    agency: "Department of Financial Institutions",
    license: "Money Broker License",
    reference: "MB104829",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.nd.gov/dfi",
    img: "/licences/logo-north-dakota.png",
  },
  {
    country: "United States",
    region: "North Dakota",
    agency: "Department of Financial Institutions",
    license: "Money Transmitter License",
    reference: "MT104944",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://www.nd.gov/dfi",
    img: "/licences/logo-north-dakota.png",
  },
  {
    country: "United States",
    region: "Oregon",
    agency: "Division of Financial Regulation",
    license: "Consumer Finance License",
    reference: "1998556",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dfr.oregon.gov",
    img: "/licences/logo-oregon.svg",
  },
  {
    country: "United States",
    region: "Oregon",
    agency: "Division of Financial Regulation",
    license: "Money Transmitter License",
    reference: "1878845",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dfr.oregon.gov",
    img: "/licences/logo-oregon.svg",
  },
  {
    country: "United States",
    region: "Pennsylvania",
    agency: "Department of Banking and Securities",
    license: "Money Transmitter License",
    reference: "94060",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dobs.pa.gov",
    img: "/licences/logo-pennsylvania.png",
  },
  {
    country: "United States",
    region: "South Dakota",
    agency: "Division of Banking",
    license: "Money Transmitter License",
    reference: "1878745.MT",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dlr.sd.gov/banking/",
    img: "/licences/logo-dlrl.png",
  },
  {
    country: "United States",
    region: "Utah",
    agency: "Department of Financial Institutions",
    license: "Consumer Credit Notification",
    reference: "",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dfi.utah.gov",
    img: "/licences/logo-dfi.png",
  },
  {
    country: "United States",
    region: "West Virginia",
    agency: "West Virginia Division of Financial Institutions",
    license: "Money Transmitter License",
    reference: "WVMT-1899654",
    company: "Alpha Trade Gain Financial LLC",
    url: "https://dfi.wv.gov/consumers/complaints/Pages/default.aspx",
    img: "/licences/logo-wvgov.png",
  },
  {
    country: "United States",
    region: "Wyoming",
    agency: "Department of Audit",
    license: "Consumer Lender License",
    reference: "CL-4229",
    company: "Alpha Trade Gain Financial LLC",
    url: "http://audit.wyo.gov",
    img: "/licences/logo-wyoming.png",
  },
  {
    country: "Canada",
    region: "Ontario",
    agency: "Financial Transactions and Reports Analysis Centre of Canada",
    license: "Money Service Business Registration",
    reference: "M20280268",
    company: "Alpha Trade Gain Capital Inc.",
    url: "https://www.fintrac-canafe.gc.ca",
    img: "/licences/logo-fintrac-canafe.png",
  },
  {
    country: "Canada",
    region: "Ontario",
    agency: "Financial Transactions and Reports Analysis Centre of Canada",
    license: "Money Service Business Registration",
    reference: "M21199887",
    company: "Alpha Trade Gain Financial Services Inc.",
    url: "https://www.fintrac-canafe.gc.ca",
    img: "/licences/logo-fintrac-canafe.png",
  },
  {
    country: "Switzerland",
    region: "",
    agency: "SO-FIT",
    license:
      "Affiliated Member of the Recognized Self-Regulatory Organization “SO-FIT” - Geneva",
    reference: "",
    company: "Alpha Trade Gain AG",
    url: "https://so-fit.ch",
    img: "/licences/flag-swiss.png",
  },
  {
    country: "Australia",
    region: "",
    agency: "Australian Securities and Investment Commission",
    license: "Registration as Foreign Company",
    reference: "647054530",
    company: "Alpha Trade Gain Capital Inc.",
    url: "https://asic.gov.au",
    img: "/licences/logo-australian-securities-investment-commission.png",
  },
  {
    country: "Hong Kong",
    region: "",
    agency: "Companies Registry",
    license: "Trust or Company Service Provider License",
    reference: "TC017446",
    company: "Alpha Trade Gain Finance Limited",
    url: "https://www.cr.gov.hk",
    img: "/licences/logo-companies-registry.png",
  },
  {
    country: "Lithuania",
    region: "",
    agency: "Financial Crime Investigation Service",
    license:
      "Registration as Virtual Currency Exchange Operator and Depository Virtual Currency Wallet Operator",
    reference: "",
    company: "Alpha Trade Gain Services UAB",
    url: "",
    img: "/licences/logo-fntt.png",
  },
];

const complianceDetails = [
  {
    provide: "Adequate operational capital",
    why: [
      "We are subject to the minimum initial capital and own funds requirement. Own capital requirement is intended for covering the risk of a provision of payment services.",
      "We protect your funds with our security measures (segregation of funds and funds insurance).",
    ],
    means:
      "Your payouts are protected as entrusted to a company with adequate operating capital.",
  },
  {
    provide: "Internal and external auditor is mandatory",
    why: ["Our accounts are subject to additional check."],
    means: "Four layers of defense for your business.",
  },
  {
    provide: "Sound Anti-money laundering (AML) policies and procedures",
    why: [
      "Risk-based approach (RBA) in assessing and managing the money laundering and terrorist financing risk to the company.",
      "We perform customer due diligence (CDD), identification and verification procedures, including enhanced due diligence, screening against UN, EU, OFAC sanction lists.",
    ],
    means:
      "Our AML/CTF policies and procedures make us a reliable partner within the financial sector, safeguarding our own and your business reputation.",
  },
  {
    provide: "Data protection and security",
    why: [
      "We maintain high-level IT security checks and data protection processes, access right procedures, and data encryption.",
    ],
    means: "Your sensitive information is safe and protected with us.",
  },
];

export default function LicensesPage() {
  return (
    <div className="bg-black overflow-x-hidden font-montserrat relative min-h-screen">
      {/* Stars container with low z-index to stay behind content */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="stars small"></div>
        <div className="stars medium"></div>
        <div className="stars large"></div>
      </div>
      <Nav />
      <Nav1 />
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10 relative z-10">
        <section>
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Licenses & Registrations
          </h1>
          <p className="text-white text-sm leading-relaxed font-montserrat">
            In order to ensure the provision of their portfolio of services in
            full compliance with all applicable global and local regulations and
            standards, Yieldfoutain companies hold licenses and registrations in
            numerous jurisdictions worldwide, and are constantly bringing their
            operations in line with newly adopted legislative changes.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-8 tracking-tight">
            Assets Audited By
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {licenses.map((item, index) => (
              <div
                key={index}
                className="relative bg-white from-white/60 via-black/50 to-gray-900/50 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm hover:-translate-y-1 flex flex-col min-h-[300px] text-black"
              >
                {/* Logo at the top */}
                <div className="flex justify-center mb-4 ">
                  <img
                    src={item.img || ""} // Consider using a dynamic image or placeholder
                    alt={item.agency}
                    className="object-contain h-20 rounded-sm"
                  />
                </div>

                {/* Card content */}
                <div className="flex flex-col flex-grow space-y-3 text-center ">
                  <h3 className="font-semibold text-xl">{item.agency}</h3>
                  <p className="text-sm">
                    {item.region
                      ? `${item.country}, ${item.region}`
                      : item.country}
                  </p>
                  <p className="text-sm">
                    <strong className="font-medium">License:</strong>{" "}
                    {item.license}
                  </p>
                  {item.reference && (
                    <p className="text-sm">
                      <strong className="font-medium">Ref No.:</strong>{" "}
                      {item.reference}
                    </p>
                  )}
                  <p className="text-sm">
                    <strong className="font-medium">Company:</strong>{" "}
                    {item.company}
                  </p>
                  {/* Spacer to push link to the bottom */}
                  <div className="flex-grow"></div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 underline underline-offset-4"
                      aria-label={`Visit ${item.agency} website`}
                    >
                      Visit website
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mt-12 mb-4 tracking-tight">
            What Does Alpha Trade Gain Being Licensed and Regulated Mean?
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Being licensed and regulated means Alpha Trade Gain adheres to
            strict legal and operational standards across all jurisdictions in
            which it operates, ensuring client protection, transparency, and
            robust financial practices. Below is a detailed overview of our
            compliance measures and their benefits for you.
          </p>

          {/* Compliance Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse bg-gray-900/50 rounded-lg border border-gray-700">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="p-4 text-sm font-semibold text-gray-200 border-b border-gray-700">
                    What We Need To Provide
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-200 border-b border-gray-700">
                    Why Is It Important
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-200 border-b border-gray-700">
                    What Does It Mean For You
                  </th>
                </tr>
              </thead>
              <tbody>
                {complianceDetails.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-200 border-b border-gray-700">
                      {item.provide}
                    </td>
                    <td className="p-4 text-sm text-gray-200 border-b border-gray-700">
                      <ul className="list-disc pl-4">
                        {item.why.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 text-sm text-gray-200 border-b border-gray-700">
                      {item.means}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cryptocurrency Trading Subsection */}
          <div className="mt-8">
            <h3 className="text-2xl font-semibold mb-4 tracking-tight">
              Cryptocurrency Trading Made Easy
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              With an account that caters to your profit and prosperity, Alpha
              Trade Gain offers a leading investment service for digital assets,
              providing high-yield interest on your investments. Our
              regulatory-compliant platform simplifies cryptocurrency trading,
              ensuring a secure and user-friendly experience for both novice and
              experienced investors.
            </p>
          </div>
        </section>
      </div>
      <div className="z-20 relative">
        <Footer />
      </div>
    </div>
  );
}
