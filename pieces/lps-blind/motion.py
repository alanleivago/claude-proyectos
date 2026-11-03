"""Shared by build.py (camera) and post.py (smear): the s03 handheld whip-pan yaw and how much it smears."""
import math


def s03_yaw(t):
    return 0.55 * math.sin(2 * math.pi * 0.9 * t) + 0.22 * math.sin(2 * math.pi * 2.3 * t + 1.0)


def s03_smear(t, fps=30):
    """Horizontal smear length in output px (1080 wide) from the yaw speed over one frame."""
    return min(260, abs(s03_yaw(t + 0.5 / fps) - s03_yaw(t - 0.5 / fps)) * 1100)
