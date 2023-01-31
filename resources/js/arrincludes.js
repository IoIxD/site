function arrincludes(arr, element) {
    for (i in arr) {
        if(arr[i] == element) {
            return true;
        }
    }
    return false;
}
function strincludes(str1, str2) {
    for (i in str1) {
        if(str1.substr(i,i+str2.length) == str2) {
            return true;
        }
    }
    return false;
}