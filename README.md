<h1 align="center">ks-killer</h1>
<p align="center">Kill your KSes with ease</p>

## Background
KillSwitch is a lightweight mechanism that lets you roll back code changes if any regression is found. It is very important, but too many KillSwitches have a negative effect on the readability and performance. So graduating them on time is necessary.

After spending so much time graduating KSes manually, we can't help but ask: Is there a better way? Yes, enter ks-killer!

## Installation
```bash
npm i -g ks-killer
// OR
yarn global add ks-killer
```

## Usage
```bash
$ cd your/project
# graduate a specific ks
$ ks-killer <target-ks-id>
# graduate multiple ks by date
# input should a valid date which could be parsed by `Date.parse`
$ ks-killer --before-date <date>
e.g: ks-killer --before-date 12/31/2021
# You can also tell it where to find the KS declaration by specifying the -k or -p flag. 
# This boosts performance because we don't need to scan many source files just to find the declaration.
$ ks-killer <target-ks-id> -k path/to/ks-decl
```

## Implementation
The [deck](https://slides.com/sixianli/ks-killer) explains it in detail.
![image](https://user-images.githubusercontent.com/43892874/147040023-d6540028-b008-46f5-b24c-7882a9725c75.png)
