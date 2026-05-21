import ReviewClient from "./ReviewClient";

export default async function ApplicationReviewPage({
  params
}: {
  params?: Promise<{ applicationId?: string }>;
}) {
  const p = (await params) ?? {};
  const applicationId = p.applicationId ?? "";
  return <ReviewClient applicationId={applicationId} />;
}

