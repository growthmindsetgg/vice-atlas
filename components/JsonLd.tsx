/**
 * Server-only component that emits a JSON-LD <script> block. Safe to inline
 * in layouts and pages — Next.js sanitizes the children path; we serialize
 * ourselves to keep control of the unicode escaping.
 */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
