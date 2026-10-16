/* 화면에 display되는 각종 서식을 포맷팅 하는 로직을 담는 곳 */

export function formatEditedAgo(updatedAt) {
    const updatedTime = new Date(updatedAt).getTime();
    const difference = Math.max(0, Date.now() - updatedTime);

    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) {
        return "방금 전에 편집됨";
    }

    if (minutes < 60) {
        return `${minutes}분 전에 편집됨`;
    }

    if (hours < 24) {
        return `${hours}시간 전에 편집됨`;
    }

    if (days < 30) {
        return `${days}일 전에 편집됨`;
    }

    if (months < 12) {
        return `${months}개월 전에 편집됨`;
    }

    return `${years}년 전에 편집됨`;
}