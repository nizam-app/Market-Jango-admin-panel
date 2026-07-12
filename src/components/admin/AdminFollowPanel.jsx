// Admin audit: who this user follows / who follows them (vendor, driver, buyer, transport).
import React, { useEffect, useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { getAdminUserFollows } from "../../api/followApi";

const formatDate = (str) => {
  if (!str) return "—";
  try {
    return new Date(str).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return str;
  }
};

const TypeBadge = ({ type }) => {
  if (!type) return null;
  return (
    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-200 text-gray-700">
      {type}
    </span>
  );
};

const PersonRow = ({ title, subtitle, badge, image, meta }) => (
  <div className="flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80">
    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 overflow-hidden shrink-0">
      {image ? (
        <img src={image} alt="" className="w-full h-full object-cover" />
      ) : (
        (title || "?").charAt(0).toUpperCase()
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-semibold text-sm text-gray-900 truncate">{title}</span>
        {badge}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-500 truncate">{subtitle}</div>
      )}
      {meta && <div className="text-[11px] text-gray-400 mt-0.5">{meta}</div>}
    </div>
  </div>
);

/**
 * @param {number|string|null} userId — users.id
 * @param {"following"|"followers"|"both"} variant — buyer/transport: following; vendor/driver: followers
 * @param {object|null} initialData — optional { following_count, followers_count, following, followers }
 */
export default function AdminFollowPanel({
  userId,
  variant = "both",
  initialData = null,
  brandColor = "#FF8C00",
}) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const showFollowing = variant === "following" || variant === "both";
  const showFollowers = variant === "followers" || variant === "both";

  useEffect(() => {
    if (!userId) {
      setData(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getAdminUserFollows(userId);
        const payload = res.data?.data ?? res.data;
        if (!cancelled) setData(payload || null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load follow data."
          );
          if (initialData) setData(initialData);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const following = Array.isArray(data?.following) ? data.following : [];
  const followers = Array.isArray(data?.followers) ? data.followers : [];
  const followingCount = data?.following_count ?? following.length;
  const followersCount = data?.followers_count ?? followers.length;

  const summaryParts = [];
  if (showFollowing) summaryParts.push(`${followingCount} following`);
  if (showFollowers) summaryParts.push(`${followersCount} followers`);

  const gridClass =
    showFollowing && showFollowers
      ? "grid grid-cols-1 md:grid-cols-2 gap-3"
      : "grid grid-cols-1 gap-3";

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <UserPlus className="w-[18px] h-[18px]" style={{ color: brandColor }} />
        <span className="font-bold text-gray-900 text-[15px]">
          {variant === "followers" ? "Followers" : variant === "following" ? "Following" : "Follow relationships"}
        </span>
        {!loading && !error && summaryParts.length > 0 && (
          <span className="text-xs font-medium text-gray-500">
            {summaryParts.join(" · ")}
          </span>
        )}
      </div>

      {loading && (
        <p className="text-sm text-gray-500 py-3">Loading follow data...</p>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className={gridClass}>
          {showFollowing && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div
                className="px-3 py-2 border-b border-gray-200 flex items-center gap-2"
                style={{ backgroundColor: `${brandColor}10` }}
              >
                <UserPlus className="w-4 h-4" style={{ color: brandColor }} />
                <span className="text-sm font-semibold text-gray-900">
                  Following ({followingCount})
                </span>
              </div>
              {following.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6 px-3">
                  Not following anyone yet.
                </p>
              ) : (
                <div className="max-h-[220px] overflow-y-auto">
                  {following.map((item, idx) => {
                    const label =
                      item.business_name ||
                      item.name ||
                      `ID #${item.followable_id ?? idx}`;
                    return (
                      <PersonRow
                        key={`f-${item.followable_type}-${item.followable_id}-${idx}`}
                        title={label}
                        subtitle={
                          item.name && item.business_name
                            ? item.name
                            : item.user_id
                              ? `User #${item.user_id}`
                              : null
                        }
                        badge={<TypeBadge type={item.followable_type} />}
                        image={item.image}
                        meta={`Followed ${formatDate(item.followed_at)}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {showFollowers && (
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div
                className="px-3 py-2 border-b border-gray-200 flex items-center gap-2"
                style={{ backgroundColor: `${brandColor}10` }}
              >
                <Users className="w-4 h-4" style={{ color: brandColor }} />
                <span className="text-sm font-semibold text-gray-900">
                  Followers ({followersCount})
                </span>
              </div>
              {followers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6 px-3">
                  No followers yet.
                </p>
              ) : (
                <div className="max-h-[220px] overflow-y-auto">
                  {followers.map((item, idx) => (
                    <PersonRow
                      key={`r-${item.id ?? idx}`}
                      title={item.name || `User #${item.id}`}
                      subtitle={item.email || null}
                      badge={<TypeBadge type={item.user_type} />}
                      image={item.image}
                      meta={`Followed ${formatDate(item.followed_at)}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
