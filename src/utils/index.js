/**
 * 获取后缀名
 * @param  {String} name [源字符串]
 * @param  {String} separator [分隔符，默认是 '.']
 * @return {String}      [后缀名]
 */
export const subName = (name, separator) => {
  let start = name.lastIndexOf(separator || '.')
  let pos = start > -1 ? start : name.length
  return {
    name: name.substring(0, pos),
    suffix: name.substring(pos + 1)
  }
}
