export function shouldShowMobileNav(pathname: string, isFullscreen: boolean) {
  if (isFullscreen) {
    return false
  }

  return !/^(\/movie\/|\/tv\/|\/sports\/)/.test(pathname)
}
