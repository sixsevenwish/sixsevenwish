import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════
   FLOW:
   1. User sees well + floating gold coin. Logo at top. NOTHING else.
   2. User DRAGS coin into well → coin drops → popup "Recharge Coins"
   3. User picks level ($3/$5/$12) + fills name + wish
   4. PayPal button appears ONLY after form is filled
   5. After payment → "Your wishes will come true soon" ✨
════════════════════════════════════════════════════════ */

const STEPS = {
  WELL:       0,   // just the well, coin floating
  DROPPING:   1,   // coin falling animation
  BUY_POPUP:  2,   // "Recharge Coins" modal
  FORM:       3,   // name + wish form + level selected
  PAYPAL:     4,   // PayPal visible
  GRANTED:    5,   // wish granted screen
};

const LEVELS = [
  { id:"hope",    name:"Hope Wish",    amount:3  },
  { id:"dream",   name:"Dream Wish",   amount:5  },
  { id:"destiny", name:"Destiny Wish", amount:12 },
];

/* ── LOGO REAL — imagen oficial 6-7 WISH embebida ── */
const LOGO_SRC = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCAC0ALQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD5UooooAKKKKACiitXQPDOqeJbo2+m2xk28ySMdscQ9WY8D+Z7ZpN23Ayq1tG8Ka14g507T5po84MpAWMH3dsD9a9i0H4QeH/ClrFqfiu7QKQH8y4T5Mf7ER5P1fr2WtWT4kLDF9k8JaIkqRttXUrgbPptz0HsoFc0sSm7QVzRU+sji9C/Z91S9TzdS1KC1RCN6xDdtyM4LMVAOOeM10afBbwno8kI1C6kuVl2/O16oVQfVVAIwDnGfxpb+x8ea4k2pavq13awrCzvNGnlb0Udix3OaxbDwjZPEJboXF7M+VAaU/Mxxtb6c0l7SfUmU4ROyi8G/CvTZzb6hpUlsANyTM6ujjp1aU/Wpo9C+C326KGNrRw4+YyRjCe/D8/TtXHR+DbHSIZJptP8+WPDhWw25V5YDOecZ/GtXxfo/h3QJbbUIIBNpNwkZR3gVnfcTnBUDjaVOKyqRlCXI5O5dOcZx5ktDrY/Cvw3fynttD8Kz2zM0ZkuxNGdw7jZMTg9uOxrf0rwR8L7q7ezm+GtjcyRp5jy6fePIuzONwVnUkZ44zXmetfDPS7bR7HXprYKL51j+zCPy2gRlZo2LA8kqAcADGRUdjoGoaRZz6rpmtXelWcTiI+bKG8w8Z2xn74ywGB3pRrStpK5Uox7HvOnfCD4KanIsMfhewhuGGRBcNNFIfoGYbvwzWx/wzp8K/8AoTbD/v5L/wDF14XZfELxR4dZ9O1axttZ09GIZYFHT12Ekf8AfODXpfgb4rWWoSiLSdTkhKKoOn34bbnnIBPzp2/vCreIlH41+JCgpaxZ1P8Awzp8LP8AoTbD/v5L/wDF0f8ADOnws/6E2w/7+S//ABddVpnjGyvphaTxyWl9t3/Z3wdy/wB5GHDj3Faf9q23q3/fNYV84wNCXLWrKL83b8wVKb2RwX/DOnws/wChNsP+/kv/AMXR/wAM6fCz/oTbD/v5L/8AF13v9q23q3/fNH9q23q3/fNY/wCsOV/9BMf/AAJB7KfY4L/hnT4Wf9CbYf8AfyX/AOLo/wCGdPhZ/wBCbYf9/Jf/AIuu9/tW29W/75o/tW29W/75o/1hyv8A6CY/+BIPZT7HBf8ADOnws/6E2w/7+S//ABdFd7/att6t/wB80Uf6w5X/ANBMf/AkHsp9j8tqKKK9szCiivRvhv8ADR9Zkh1fWovL00/NGkhKiYD+I99meOOWPA7mplJRV2NK+xU8A/DC98UlL+9WSDTOoI4eYDrtJGFX1Y/QZNem3mtad4SiTSPCUCXl/Cp2NFgW9u3Qtzks3feeelVNb8YnV7tvD+hK0NpEwEtxt2M2OMe3bgYUCq+m6Zb6UpXyVfznKjDd/XI6mudQlW1louwp1Y09FuU9N0+61i/a98RXbT3Ko7oLlS8QbsqrnGevJ9K2rDxIum6XDBpGl2M+uNK5eaTOIoxyrDOcDkDCgdKnsra5a7msoLY3ZnUyAKQWRUGSeBxx1qkJEhuHufLgKkBpMKCCf8/zrWpRTjZdDCnXfO7jlbW9W8OaxqGr3zXl3cSxWEAHyogL5k2jPXkDJ7E0sMdvCUlEM8rQsAqBvlBB6HsB71PcaxaS+FWhMqB3uzJtL8kiQEYU9Dt/OlRzFLdC3Dy723NsUsE9Pw/Oow7V3fv+Vi8Umop/1qSEtexTz3GyGSOTcIuSevY96uaXa2virQLXSdTZVh0K9zvfdnySNwTI7FcD8KruNQujayrp0ihY8SYTgsD2z+H9KzdUbWLSa6hsoXRNQhWKVmYqyhSfmxzk4YjrRi4ylaUd+5GCcY3jLRdjft/FOofECy1CwQRH7LfRSW2xQAkY6ZxzjAPbpmsvxDeR39wdIgU/YdKQEAcNLcEEknHTG4k+59qyl1CXwldzSW9nPL9ph8oBeBuX7pPPTk8iqsaXFlHFJLMGWcht7tgFieXJ+tc1Omk7JWXQ7Jzur3Nqz/024sbO1tnEzyCOW4yfmyeWb02gE984qbxpaaZrOt3VvoNtLaxacozcmZjKJGIICnAIAGMgk8mi11STwjc77+FX+x+ZG2HVoy7DB2sDgkAgZychzWHZeZpUd3dXMvmz3LSyylWPz55J+np0IxWs4Xlddv6/AyhPljZ/1/TOi0P4k6poEMeneK1fVbBcMl2CRNbt2Ykcg/7QP517N4T+IVrqNvHJNereWMjBItQ4BUnokwHAbPG4cHHY14jN4XiFxYadqXiSC11PUoxLFbSrmM56AtnJPbIGMg9cVn6Hq1/4Jvp5bRPtNhkpeWDvuRucMUz+PHfqMV5GZ5Th8woulVV/To+67fk+p0xquL10/r+vM+twQRkUV5t4F8bw/ZrTMrSaRecW0jvuazb/AJ5SHrtznax9MGvTxZ3B5EL/AJV+OZnw7jMFWdNQc10aTd18tn3X6HdGrFq5DRU32O4/54v+VH2O4/54v+Ved/ZuM/58y/8AAX/kVzx7kNFTfY7j/ni/5UUf2bjP+fMv/AX/AJBzx7n5lUUVLbW8t3cRW8EbSTSuERFHLMTgAfjX9LnjHonwe8B2XiSa81vWIjc2OnPHFDYqcG/uXzsjJ7RgAs5HOMDjOR2/i/XpZNRGjWcx3kf6ZKgAjUDgBAMbRggKo6AVnH7N4G8IQ2UMokvoRyI2wHmdvmbj6BQeu1B61N4It3+1XV5Iryav9ke6hBBcGcnG732gcfWuKc+Z8z2RqotaLdk9n4abSIo5ZNPuooJ1P72SPYGUDO0e3/66Hv1smt7eWdLezmkG64MJcxZ4zxz+PvRa6zaaWba+8VanfanPOpeGJV+SGMnl3KjjOOnp61qaxp9lPbpHp13G1kyGeNNm50x95CeARyMNxkEe9aRrOOj3MJUFLXoWdQ1y6tLRNL8JxNb21wC1xq0uGkuyGIPl4PQEcZ4GOMnmszSdHur6Gf7A0csTbUeWZhtRepJc/Tmq1y1lpenwX+oSfYNP27Y7aOQh75h6ddqjPUdT0znjMv8AXNY1xo7dol07SsgW9hbxkAoe7AevXnJPc1Curpde/wCv+SG1dJvpt6eX+bLeoSeE9HvxcT3cmtXoAzBaQZXA4AZuoHT0zUTeMPFF7Ip02CPSoRlVC7VOOg+VB1+pqxb6HbQRZto96Z+dkjxk59RVqTyDIbZUwkUODGAQT05PvWqo6e+zJ4hN+4jJh1DxfcTPu8RTIc4+UH5/bk4NL9s8XwBZF8RXaYxgkAD2AwRWvJHF5YdAUMeAqlR8x/zzVeeBZ4JC0Mr5w0cokyq7T3HqfSl7CDWiGsVPm8jKk8T+JYh9ov4YNXhiJO2eJcvnrywNK+p+HdYVTqFvqGgXLAbFQGSB/oDznn+8fpWylswhjaWJntV+98jKuO5x61n6lZwzoQ0UToTiMYIAHb19O1CpNPTQPbxe+pDPa6vDZx2M97FNohZZITEuUO0llG4dOeSCA31q+IINf0fVIUErajYohS2QgLLEV+bAIyx4foR24NYifbfDdxK2nN51tJ8stlNlo5lPXaT6c0+9t01e3TVfD93LaXNrkzW4JMlv0Jz/AH0JH1HXnrWbjZ6aM3UlJa6o1YtUg8SeD2fVLZf7R0YhEnC8zxDbt69CCQe2CD60thdWlxqYkubGTTIHziMuJMsSSXYjoCSPy96yDca14i2Lqt7aNbqQ3+jIQZcEHJz0GcZxya2LKGW6kuxFbxyqilzOzYit1zkvIew9Oevr0pRXLe/3CqPmsitpusX/AIO1S4uYvLm028Yi5Q/6tMtw+O2evscdK+nfhn44NzbwaTqE5ncx+ZbXOMCRM8qeThh6entXzZqEnhv+zH0e2uH1jUZ5A7zwrmOMcjbyQFTB785GeOlXPh1qU2n3reHW1YxT2mLjTzxiRhxjd1/2cdOQaxqzlZypOz9P60NoxdlGR9l+dH/z0T/voUvnR/8APRPzFcT4X8QQeJdHiv4cBiSkqf3JBww/z61rZr4fEcd4ihUlRqUEpRdnr/wDVYVNXTOg86P/AJ6J+Yorn80Vj/xEKr/z4X3/APAH9UXc/M2vQPhJ4bXVNSk1KWQR/Z5I4ICc/wCtfPz8f3FBP1K1wFfRXhDRLbwj4OyS7zCEPJLDlW3Ogdypx2yiZ9K/ScRU5Yabs5acbvU57xP5WqeJVstjCLTFMZ2DAaToOvcAAcehqZpZ7Q2d7YI6XFluADE/vASMjI6dBVGwhY20dzKjLcSAzuWbO5icmtmOKN8SqELNGDtIPA+v0pxork5X0MJ12pXQkPi7Qprd5ru8ksrhMoURRuIJyVKkYYdeR69KLKSKZJtevoDY6HZJ5YhIIdl42x+u5u/oPrimG0E95BAsKE3GNrSH7oP8WR6AZPtVHWbmPWtUi0Wyy2j6YSGJJJllzyT6nPJ+o9Ky9nZ8qf8Aw39bGqmmnJr+v63IZ2vPE2oprl8cmRytrZk5W2jBAAx2JGPoK1zFDBdKJJHnuDj93E2c4ONpPT16Umjabea7cx6bo+XuZBukmK7I7RR1Lse3Tnj0rYm1rSPCEkuneD411XWo8fbNduE/dWvtCOzfQlj7UOsoe7H+v8hKi6j5pDrbRtSshF9tvbHw9DIm5Irxv3hXPZAGY9c8gVQv1ksJpY1vY5t0p2zoMq+P7pwODwfbvXK6z4uvtbD2drcz6ncZJkuJ9uxCTkgYGfwB/E03Q7TURc7bi6klXsM4RB6AdBSpe0k7yQ6yhBWizq0Zo445dyyRkFTubpx1qjqZNtaXSIkjbwDD5D7VUgn7w79elWZbqC2dUceYBjdj5i/4dqqXq3N5PHDZ/uftUqxQqke7GWH4k5xXap2OBQd1qaM/xJbX9NtdKj0qKzs7VVjlkVAkm3adwLYwxJ6AZ5GcisiCUTywpIZFhVSYip3t9DWrN4G8cJdxtc6BdTRsc77eFSjdt2UyDUq6J4ntJ38rw3qfUK+22ckqOvAHGeaxhOEFyxd/mbyhKT5mrfIpGMh4E3FxMhG7OdhIA+h6np0qo2nXlg51DTXltdSi+QSocJMv8SP7Ed624PDOvwbJG0PVGXBIjktJMjPTd8vT261IdF8Qzw3cZ0XVoy/WKKzkwUIH+z/WrnUhJWZnCFSL0ZgyTjW7Ga+0iJrOIOI720fBNux43gf3SccZ7+hqe/8AFWq6xp0WjXlq1lpQQC4SyVFM2PulQRjaOpz8x6Vd1HSvFXh3U7XU7Pwzfy2zwCO8/wBAk2SxEYYEFecD16YNVLiez0e5jEkUtxpLqlwrQShJFhbIznBGATyMZx0rimr2T/r/AIY9CDtqi54Vs573QWgt4IxHFKwnDYVo5APlY+isuOTxx6msTxjaHSJbW50++il1GD55FjY7lIOSAD820r3OOR9KvX3iFNduktdL3afpsOQ1zAgWafjGVJ57n5jz7VnxWdtbiKaKGQ+c2Hlb5n29Mk9Sc+tXTg5SdkROooLXc9n+GPjBH1OCcufsmsALIzAALc4yMfUEfn7V7HXyN4KuJbZLzQYbmSZrVjcKqggrgkpjPcEHkevtX1H4X1ldf0Cy1EY3TRjzAD91xww/MGvzHjjLFSlHFw6+6/zT+7T5Hdh6vNoa1FNor8+5zqPzg8PWA1TXLGzcZSWZQ/8Au5y36A17z44k2eFrS1AERmdI1ZXOcFi7DbnpjZz7V5F8MbV7nxTG8YXfDDI67ugJG0f+hV6D4o1ATarDZ+Y0yhd2/ONoGFzj17V/SVRc1aK7ankbU211FNvcxWgnARoyBGAvdf6/hTZpQsXlxFWXBKFhnB7/AEp5MkkMUEMTKJTy+eRkdh9P51BfXEqCclSnlRZQDp0wDiuiTsrHFFXlYlt/EH2fSJ9RkBEpQWtqWIQq2cE/gSB+dL4a0e4u44dJiVLjVL4+TGiNgjP8bEDoMkn6U3VbOO81LTtFihKx2374Iz9SR/Fnvls/hXY+Dba30DQNU12/t/Ou7xjbxzrlfJjHRkIweeuQf4RXDVmoJtf12/zO6EXKyf8AXci8RT2+g6fH4G8NzxI06btY1QBhJuBwVPqAeAvr9DXnOsPC13F4e04i1s4gHuHDEnnkjpkse5966m8mFlpOo6hJIVn3jegf5izHCrjo2AQPqSaydGint1TTrm58hp5DNMZehY5AOAM8VNBKWr/p/wDAKrScFZf0gttNsLKEIqmJGG2MIp3P1wR7etX5rOG5txLc5gLYB8pcZ6dBnnpUJOyGONJUYREqq8nYfqemavQ/vTi7Q+WRhWBAHp0616SlGOx5ko1JWbKEVt9llmfmOyYkGeRS3Hb5Qee1anha3VNZ0tkJZbQtdZAJXco+UsMZ5JXGPeorq1iSFPPIMJCs3z7epxVvSL630bR9Y1OW4DRsqQQyEFcYyxxx7qM1y4yb5f666HVg1zS1/q2p6BpPxj0zSoF0e0t4fLsZ5YmaRXbd85K7cH5QOR37Vrw/GqyWeYYgcMwz/oxXDEY6g5PPrXzfDeXOp+e1lHFaxqd4klBYt74FWgmsWrJNHqVoHf5/kQ4Y/UVxTwzk7t6/15Haq0Y6WPoFfjaTdrI5MMcbfIfIYiY9CCS38h+NQ6p8dYnWSZ7FJoo0JLbWXoOgbOcn2rxh9T8aajJbMdUsAYYyImNsvAPUZxzmrWiS6kwub3XLuOe2sZcW6WyLEkk2OwAySMjHoxFZuhy7v+vuKVSMtkd544+Ltze+DbhdLEtlb3oLhYpXZ5nkwNu49ucYGP5153otg0Gj3Gm3VxHJfWQ+120aIXBjPMi+2MHr6CmXiXGo3/2IoGW1bLgNhBMwzxjHQHA/E02O4fStasNWwCEfyJFznejHBB9s/wA66KdNpXX9dvw/MxnUXNb+v6/yNGxtraXyZ/tEaykgqkS9OPr681FElyUexMsMkdw+I8j5c+vPI5qN7iDTtWuDaIzCKXNtkZ4bqSPbml/dTeZFESAjkmRe7fX/ADzXoQaUbo8+onzakdgq6Z4qs7+MiJZx9ncleD3Bxx6frXvnwgvwq6rpBbiGYXMSnn5JBzj2BA/OvANVWSdYZDlpI2ST5e6hgSRnpxmvWPhxqiweN9KVAYxf6fJA2ekhT51P1wP1r5vinD+3wFaNul/nHX8ro7sI3o/6sz26iiivws9U+BPhcsS3mozysUWOBcsO3zj+eK6fWSG1kzKgVBAq7FGFIJJxwOvf61zfwwwr6jIwyqiHIxkMdxwCPfpXZajra6Rqd7mzsWlktgBBdpuWMg4yq8ZI9OK/pBt+1dkeU7cmpfXw7rNv4dt/FapFNaKUjSCJgHAYkAk4IHQ9eTWXf6dLby280yTRwTsi+TPIrSKcjjj6/rzS2mpy2VzBaaNq08NsQs72cgzCWBBHUnI3DIB4BWsy+u4NT1mB3nzdSOSyDCKrFgW3D1yB3NXGUnuZuKNPUr6E+Kpbe0ikkursRW8TS4bG7O5s9iOowPxr1LxBdwafoUNksSgm1VFDAEJ2Tp6YBz3ryzw1AF8a2ouY0kNtcbmdSTuURAcHHTnNdh4i1Bo5ZFUlmSdIvOxwY1yFyPUZAPY59687FK/JFHXQ3k/MyNb0dtZGm2MUkVulqhu76aUhVLfwc9z1wP8A9dalnrGhaVETZaUb6c8zXmpFSz8dgeMduQfrXL6lqLWzTee4DFwVUniQ9FyPYDj6+9ZMGneZL512y3ErnOHJZceh98fyrejTlKKSZjXnFO8lc9eg8Y+Fm0//AIqfwTH5SMGN5YRKiKvTLGI8euSBVLxB4TsbS0l8ReGrqXU9FVC89o6r59spxh89GX/aHbr61w+j3kvh+9glS5drSdgj2zsWMZ6AjJPyn06V2GkSw+G9Rt7y1ULpmobkltdhEcLsM7VGeUbB+XpuA9aiU5U3yv8Ar/JjjGNRcyOYe6E9o7uhKSdGI/AHrx/KuYumivbl7Bry4+xIyM1tncpxgcMP1rtfFuhyeHbvVoLZ0+wTIk1lG3JCNwQufQ5GfpXS6f4o8FaXZafDrejQTXdnEEm228ZFx8vV2I4IPfrWzxK5fe1uZxw1pe7pY4uxtbG8idY4wrIcIqR5Cj/PH4U4GWYtLeIsOz5QjKCCSeSM10Wq/ETw/dqY9F8KaWHX5lZrcFm9uo9+cVxGreKb3xROEMdjaWls4JFrbLGJHHqQMsB6k4JqqNe7tZmdTDaXudA8c738FnYRb3uCIokCKC2eBwOg759iaj17ULa0b7FAGez0lXdcAfvZ2wxJPU9SfxHpWjoM66boV54nvLfdLcRG2tEZCQwPysQ3948KOc8tXH6jFPHdWVl+7mkeb7VMuSfmJLbWIx1OePaspPnnbt+f/AWnqzajDkhf+v6f5CaeJZbIbnbBcySOB8wJxmrWqu6aE8QXEYkLneBlnHJIHX0q9oOi3viK/Gi2j2keF855JGCpHHnuSfp+gqLV7WWymv8AS7p491lvQuOVJAPT1B/rXW+WK5fmc0bylcS6Bhv7Ge3AIlQMykAqRtBI9fWtTw7oOoeJXuv7Gu7KyECruW4cZkbJYBV/Pn261gGU2FjYyxbJNiuqiRQFQkLg5rVi1rz5ltobRNH1dhhpFTaohIOVLc7wTjBAz1IIrL2slGy/q3c1dFSlzP8Aq+pRSWe802R1trqNLeH940pBQscjKsMfKT0/HnvXZ+E1+z+KPCmoo7EyXEMb9SCGTaDz0Izj3rnNe8Vy65ANM1jSxa2VsPLF1aqrKj7cBVOMomcZPtzzzXQeGIt1x4WLSBGW+t1AB5k+ZQDn6Dn8K48ZepScdr3X3o3pRUXb+tz6THSitb+y4P8App+dFflv+o2Z/wB37/8AgHV9Zgfn58MbeR/D3iu6iOGtIrSbPXA8/b07/eFdL4htLSa/sL21g82IRAMwO4o2SQM9uCRXJ/BvSzrXiDU7BV3vJo186L6skRcfqtdFLK1x4atryMgiKdA5HJKkEc+3Sv2GatVTOHeDRRuLVoJftNkwtvMUq+1c59CR2NV9TzFp0dxBuZonDFs8uR6n8P1rVYiOBpI5HlSQlMkcgd+KBFbT2ThQCvKNhcAH0ArdwVuZHLGo3pIuRFYdaW5tlZUkRlGXwo/d5OD0zhfxrW1SGW8v1ETsjSSnzDv2x7cAljz6Vytpci2021uH3EJII5OOARlCT74IP4mt+SUQBTMd0ssKSAAjIUcFf0zXl1k019x6dJ6MyPENus/iG2iLK6IC7ndkBsDAya07eOFktmMZR5QwETkZjIzzj096d4gt10y8s2ktJDbzq6Bz/fKhlYH8T+VNijM1zbyPuVhEV8yRw/A9COxz+FehhPhX9dTzcbfm/rsM1K3iit44mQ+ZFGZUlRgTw2Rnvnj9a6O5jafTLYxLO48kMAc4V8Z49MGublkSOCSNlkLPhULjKsGOOnUHkj8q6S/gisbVHgmlMccEimRe4HYj9K48fL30/wCtkdWAi/Z2/rdmd8QNVW6s7eaSKR4rVdiHzcckDAyB6jNcVa/27PCl0+rTIzcsI40yPqSOTWr4puVubfToEkeR5JgXDDHAB7D61bgaGASOlwgeMkNEgI2jkYx35rbC0VKCUiMVVcJNrqY9vpEswnWW5u7nKneTLsVT6nGMjrxVm00F3v8AT9HsmVXuXUEofuIMkn8AD+VaVrsnia7mkXChjgoN27HAz0Iro/hnFIs+oeJ7uNpUyYISRtySBkj0zkLn3NOu/ZRbX9PoRQvVepL49ntrnVtK0axj2WOmpgR5yFMeMbvXnPJ7rXGQ3c17Nc6rIdzXMrRp04Ufd6dOlWtU1BbmHVL1JGKyStbxuTncudobP1JNWbS1jtowlo6bwoWOZwV49wOnesMNBK1/66v9DfEydrf12Mu+iubW4tZLScQXIQRsVIYSY9vrg/hRqH2qKCQXMv2h2bDyFeJHJ6HtxwMVsw6MxhIjcOyN80xA5HQsDms+xt/tGqLazoZonlywU/wrliPToDXZKUE3M5Ic7Sh2H6pa20ccNr5puoRGhmU8eWSMFcelVIdOubzbbDUZWgRsozoGYewbjt65p/2gX+p6j5UeZZHWGJlOFG3PYe5rR06WS4zBxbyQjILcBjnBPbr1rKlSU9zSrWcNiCYfZbKS0W2RrRIyqlvvOTnLOe5zmu58GWSXHiHwbGPkcXcCuinIO0Bs/oa5OW/E32WzQ4aSUq3yckFsZx9M13/wjY6v8UNMgAEq2EE965AxsyAig/nWNan78Yrua4ebacn2PpiiiivRIPzU+G/j27+G/ieLX7Oytb2WOGWHybndsZXXac7SD0r02LRbixbWdAdI4pkU7EwSAHQSIw74wR+deFV7hpfiqXxLYaL4ouFKXEKpomouCGMzxpuikI6jdGNv1jbFcuK5klKK2NKaTvF9TBs5pXRIX+XqJGwSFx/LPrV10W3RJUeLZtw2zPXrhh606bSpl1eTTLZJZI7tvPjjaRUBXlsFjxkDcPwqrdyLJYXBO6OWVwscfIU4GOpHTtmulT5o2RytOL2F0u28v7XFfJtt73Hk5U7iwB5A9COh9RVq0uW1KyQuWOoaeWjaL+JmAOBz2YZ59/areuPcaksdy187QgLLbzgYAboy7ecBSCCB6Z71zmqPdmaPxBpgXdGojvYfMxgjp1+pwf8AGuGpDm1/r+mddKdjt40Hi7w+IFZluUCG0kOSzOmVCHsGwWHzdCAKyFuYyqLcqluycbJQRznlh7ex6dO1Z2kakl75l1p0qRyvjz7W4JxI3A5HJVv9oZB71uDXrmbfJqvhg35xhZhKXbgdykg3cdyCfeppSnB2W34/cFWlCpqyHSUiv7sTxEGK1/evK6kru/hXrzlsD6Z9Kb4r177N5Ol2QLgBTMeT8vXbn3bseQAevFRajrmq3VgkUFlbaTaBmKHjO7jJ2qSWYDu5wK5q8nkvInsdNLsQS0szuCQx6sT3b6dB0olF1Jc0v682OFqcbL+vQt2VwbnUxMR5sFqojRs8Fyctj88VqGd4pEtrpIfJVyzCJBkDPIJ79P0qvpEb6XZ2saqpESFOmVlB789+frVq4idFX/npy+xCefQ89ua76UeSNzz603KVuhVvnkgtGgVdzTN8oGRuz2wP89q7PxReQ+GPBFtpVo7faGUO4wMEDvu75c8fSuSitvK1+yLTgpbqbl3B3KcYIx174HvU/isyFbaF28xHZEyHzkZ3E889RXDiJc84rzud+GhyQb8itci3i0zRtOcNseQtKf4uFBP/AKEK2NJhOsX9vpRu4LG1cMTeS5CgqvQYBJPPAFYmqIJdeAeQ7IlcR4IJ5baOOvRetWLizQ20VrPcS2UkTFoXj+Vs4656f/rq6CbWm7/VmeIkk9djV1OCHTr2fSnv4Zks5QUniDNG/wAoOR0zwRVIan9m0K81VERGcmKF1yGP8OBzznp+dVNNcgfYlneeWSQtJLJjOD3b/PYVDrLJqupwWdiP9AsMR7Dj95L07dTxkk9zRJu/K/67/ft94KK3/ry/z+4ba3v2CxRoUkEifOWDYMe7k5I7nFdHHPa/ZmtZIUMqjzcsu5iDz+GMmsC6vd9vc29hEv2JJUjuJMnNxIA2F56KPmOMfw1eUW9tZF/MMgRV8xmGCc9g3Xt39K6qcmkctWKk0S2n7zUknUZSCHcDjcSW4Gfpkn8K9q/Zk037RceIfEjJhJ5UsoGHOQmWf8OU/KvE1K2mhmQgNcTMDHHuO5j/AALgepJ/A19bfC3wr/whfgnSNGaIieKIPcNsxmV/mf8AU4/CuRy5ql+2h1/BTSXU7Ciiiu4k/Kuus+H2ux6ff3OkXkwh0/V0W3lkJwIJQ2Ypv+At1/2WauTopNXVmCdj26eB9c0e5t5oydTsmaN95LMCOvTnHX1B5rntZvb+eJLiWQSwvjMbZPkuoCuo7DkdvUGqnhbxYuLOSLcl/bxeTcFgCsyA4RwO7AHawPYKfWui8SxWGlKNSt1ebT9TJ+1wRrkWrEcsmDwe+09sdwa56a9nJQfyHU95NobDK+n6LJc6dHcXHh66mXzYk/11rKFGXA74PBHTnNIqNp7nVLO5TULS4ULMu5XLqQQAV7EDscHtVGx/tPw1cG+tYG1TRpgfMjBYxScYzgdH6f55q7bR6Vql7HNol6bG925+xOxSRyedoDfeH159DSkltL7/AOtiYprVfcU9S8PW0lvHqdjb7tNlYATxnEtsxHCtjnacEg9+nUEVJYW+trLi01qYED5GZEkbj3IzU1re3Hh+9ubu1t4NzSeXe6U+5knjPLHB6DI59yMYOCL0NlZ63C994buH8wsfN0i4cmVW7lCBk/Q8+x61El0kXfrEy5tEvtTi36lqV/dmQ7EWR8LjOcFV6g/lVw6HFpKGJ4cygAiNQPLC+pPsePoaSzkEUk6zyR2s2MeTcqRIG5J7e2Pxp73YbZG6F4ZE2uHGNwPJz+NbU7RWpjUc27rY0tV0CTR7azuJ9StdQtbxwZYbdvmgYDO3HTv1FZT30jTyzSl1lAxjbwMdvY1DHat5qy2168kcOMea+Ni+iDkn8eeKluWEt7uuSDHJy0irgKO/scYNV70Y2kyfclLRDNMcQ3fmyASefMkWFVWIUE5PPToOtOv7jzdSt8lwnnsTwBzwOg/yKp2dxbRvLuIKM0rxhuoboDx7CnxpA8aymSV5Y7hFEWw52HqT6dgPrXFNXnc74aQLj6b+8k1E3cBaBY4XjXa7/Puffj0ycfWorq7LIiYeSYn5VVcFvqPxqiY5/wC2JWt4RIpVYigGenGOOvWryyw+Hb5fI26nrUmSiKQY7X/abGRke3A9z03jLkgvQ5pR5pt+ZU1u1nsEGlRDdqdxIGnPy/uYxnC4Hf198D1q7b201ro4s7eGNxIBDFH/ABSSNgE8Z4GR+NQzaVJYwG6kU3eqzzouJSSsowd3AO4YwMYPOfpWzf2F34TurR47qOTXrlFEiQLldMgYgYK8jeSTgZJGCTz0Fvrv/X4f1uRJ3Vlt3MofZYNV+xvEsdrpnN2qdS2BvH+0FxjP1qTT0fxBfx6cn7uKGJZZ3C/KAWLAE+oVwPqQKW4FhY27GG3S8kn3IiFtzXMg5J9xnBY9BnHNWJbe6s7O30Swjlvdc1K5CNs4aR25CjnGc8//AFgKdSbWi1f6lUoX1ei/Q7r4PeHP+Fg/Epbx4caLoCJK0ZAKtLk+Wv4Yz9FPrX1cBiuN+E3w9h+G/g+20kus1/IftF9cD/lrOwG7B/ujhR7D3NdlWtKkoKxcpuTuFFFFakn5V0UUUAaXhzWm8O63Z6otrbXn2eTc1vcruimUghkYehBI455r1qwvdMez+1ae0114evT5flSODPZOefJc93Xkq/R1567lHidanh7xDd+Hb37RbhJY3G2a3kGY5kznaw+vII5BAI5qKkOZWBOzuejy6fq/he+lfTbiJLWTMkcbjfDMhGCRxxznPuDxxVS9n0pxbrq9ve6RfxKNjn54Nucgr3UZ9D+FdDout2d5p0d6m+70XcEkQsBLZyt/AR05HTorgcYIIWhqthJCrveG5vbJQYrS7iG8bByI5FJyAM8HqM9COa5025Wej/MppW7oppp2r606ahBqdjf3FqihJoZQXZQNoDo2M5GAeuaJ7D7Vdmd45tM1AZ25OGJ9FOAJF9vve3eq97pWkSw2t5axizMgKgxXYaQ46llUBkx6EY9CaJv7R0yefTby/wBReNCmbeSNLlSPXaxxxx0Oeaq1xXsa/wDwl9/5CW/iXTItVgQ7RcgESpj1I+b884p5fwxfyE2OqXensM/urob1B9MgbsdulUoEvrm1+0WFzFPBCckrnevoQrHcuOu0kjjqKrz2LSyR+bdzXKzHEzXB8zk/xYPcHnjHFTyWV09Bcybs9y8ul6gWb7Hc6ZchuT5cwQsPdW/pRc6Fr99beRHbQ7uRhJNxOeuB0rE0bwtqOrW/2+EXFlpnmiKS5Dts68+xwOce3vW54i8HW1mLc6DrN/O+X3eagUpjBB7jnOOvY0XtJLS47Jq9zNm0rU7S3iiaFA8YYCSS4jUAFsjgEt39KoXM/wBlnP8AaGrt8/ymKxYqzfVm+Y/gKht7VZoXM900s0shTbK5OOOTjpmtuw8PhbJZYbOBIopPMFyQqOTjBQkn5vWj2bu5MftYpKJmQ6nqrlNO0u0axiuOmBukfPfkkk+5NdFoWh6jotrPObe0xOSpn1O4WJTkHk5+ZvwqjpDajcPLNayxaeyHaHV42djjjOTnPsP1pNZ06acJb6jdT316z799yCiRDB4y4GSxK8+1acnLZqxk5ObcXt/XUstq66Xci7v/ABHY288qgefYH7RcRoP4I1A2Rj35b3qb7ba39ukfhXQr23t5gVku9Rm8yW4bIy5Axx0HYc96ox6Kk1wthaaXB9tjUMyW8yyJ0HLuvTjJIzxxWnbTDRk+y2Es95fyhI5LjJKxDdxHEBkgZPuTxjmuapK2q3Z004J6PZCpB/wjTS3UsgvNTKgNNK3y2wx3C9xnhQMDp1PHvvwF+EMmhbfGPiKAjV54ytlbyr81pCf4mHaVh1/urx1JqL4P/Aw6dcQ+JfFcO66VvNs9Pk5EB6iSQdN/ov8AD1OW6e410UaTXvS3InJPRbBRRRXQQFFFFAH5V0UUUAFFFFAGx4X8U6h4S1Rb+wMT5UxzW86b4bmI/ejkToyn9DgjBANemaF4wtdfv0j8NWTwXs+QdGnk8xZT3WFzjzO+EbD9gzGvG6cjtG4dGKspyCDgg1E4RmrSGm1se3rBpmqPLHFdS6HeSKYbmOWMFCwP3GBAYD2OCKpXljLAi/6HDprxALFDGzNHMuPmLMTu+bOeOnFedW/jTVfPaTUbmfUt5+Z7iZjL+En3h+OR7V22h+Oo/sLeTrCQkAb7S9Aw3bgkFT9QVPtWEqco7a/n/wAEpNX/AKt/wDRsLK31APPp8tzZ30OA8bor9e2AcOPfAqLUI5bd5rUW8D3hUrG0Kt5kWerSLyF+nX6VfgvtB1pYxqGnpvj5863Y7W59D/RhU0mkB/O/4R/xVp1vEfm8ieN4XzjnqMZ/E1CrtXX5g6KbTf4HPadrWo2NlPoV1f28dioLQh4S0iKTltvzBevXv0pbDVNVsJBFtLtP96RySX7AY9AOxq2fBet36EXd99rZX3RyRzIWUnqQwbp9aL3wHraQsi3t75TDDeY8Y49DyP580ueN2tNSlDZnP2s1rbXs4g3XkLllLyKcREHiUqvUdcj0q9DFLrCl77UIrhY2/diEYtyP+Ag4/EVet/C2qWsKtea9YafBuwVS4QEjHTapPP4cVPHD4PsJWk1GeXUMgqv2XCOOOu5h9f4a2lVjbuZRpu4RWdhYFWv7VBc+WGht5bdi8vYbZYnUFevJI47VctPDKoN/iTU1toj8yWZUtgE/dVT90dgXPp1ra8G6H4z1lTH4I8LTafbE4W8dfKDZ4yZX68dl/KvVPCf7Mtv5wvvGepNqEu4N9ltmYID1+Zzgn8APrWFqs3fY0UYRVjx/RNG1TxPLLpnhXTBb2VuFaYquI4lGSztJgZyOeevYGve/g/8ADbwt4ekFws41TWol8wzNCyRwk8Exhu/+0efTaOK9CutJsNF8M3llp1pDaW6W8mI4lCjO3r7n3PNct8Nf+Qld/wDXAf8AoVdNOio6vVilO+i2PQqKKK2ICiiigAooooA/KuiiigAooooAKKKKACiiigCa3vLm0bNvcSwk9djlc/lV9PEmopKsrSJI6nIZ0G4H6jBoooEzZsPF97MoEltZN25jP+NbMWo+e8KPaW21yflCkY57c0UVHs432LjJ2ep09o+mQRi4m0DTrtvSZpwPySRa63wl8RotGd20zwR4NtJEwRKli7Sf99tIT+tFFUopbIzvd6nZ/wDDQnirj/QNF/78yf8Axyj/AIaF8Vf8+Oi/9+Zf/jlFFHUop61+0H4qfSL1TY6LgwOP9TJ/dP8A00q5+zV8Q9V8ZeI9WttQgsokhslkUwIyknzAOcsfWiimB9DUUUUAFFFFABRRRQB//9k=";

function LogoCoin({ size=120, pulse=false }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      flexShrink: 0,
      display: "block",
      /* Golden aura matching the bronze coin border */
      boxShadow: pulse
        ? "0 0 0 3px #C89A18, 0 0 38px rgba(255,215,0,1), 0 0 75px rgba(212,175,55,.75)"
        : "0 0 0 2px rgba(200,154,24,.55), 0 0 24px rgba(212,175,55,.9), 0 0 55px rgba(212,175,55,.45)",
      transition: "box-shadow .4s",
    }}>
      <img
        src={LOGO_SRC}
        alt="6-7 WISH"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
          borderRadius: "50%",
          /* screen blend removes white background, keeps bronze colors intact */
          mixBlendMode: "screen",
          filter: "brightness(1.06) saturate(1.12) contrast(1.05)",
        }}
      />
    </div>
  );
}


/* ── Wishing Well SVG — Medieval & realistic ── */
function WellSVG({ glowing }) {
  const wc = glowing?"#c0f4ff":"#48b8e8";
  const wm = glowing?"#4ec8f8":"#1560a8";
  return (
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"
      style={{overflow:"visible",width:"100%",height:"auto"}}>
      <defs>
        {/* Stone gradients — dark medieval limestone */}
        <linearGradient id="s1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#c8aa68"/>
          <stop offset="45%"  stopColor="#a08840"/>
          <stop offset="100%" stopColor="#6a5820"/>
        </linearGradient>
        <linearGradient id="s2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#b09850"/>
          <stop offset="50%"  stopColor="#887030"/>
          <stop offset="100%" stopColor="#5a4818"/>
        </linearGradient>
        <linearGradient id="s3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#987840"/>
          <stop offset="50%"  stopColor="#705818"/>
          <stop offset="100%" stopColor="#483808"/>
        </linearGradient>
        <linearGradient id="s4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#786028"/>
          <stop offset="50%"  stopColor="#504010"/>
          <stop offset="100%" stopColor="#302808"/>
        </linearGradient>
        {/* Cylinder shading L/R */}
        <linearGradient id="cL" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="rgba(0,0,0,.8)"/>
          <stop offset="40%" stopColor="rgba(0,0,0,.3)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </linearGradient>
        <linearGradient id="cR" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="60%" stopColor="rgba(0,0,0,.3)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,.75)"/>
        </linearGradient>
        {/* Center light */}
        <linearGradient id="cC" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <stop offset="44%"  stopColor="rgba(255,210,130,.15)"/>
          <stop offset="50%"  stopColor="rgba(255,220,150,.22)"/>
          <stop offset="56%"  stopColor="rgba(255,210,130,.15)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </linearGradient>
        {/* Moss */}
        <radialGradient id="mg" cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#72cc28"/>
          <stop offset="55%"  stopColor="#3a8810"/>
          <stop offset="100%" stopColor="#1a5004"/>
        </radialGradient>
        {/* Water */}
        <radialGradient id="wg" cx="45%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={glowing?"#d0f8ff":"#78c8f0"}/>
          <stop offset="35%"  stopColor={wc}/>
          <stop offset="70%"  stopColor={wm}/>
          <stop offset="100%" stopColor="#041428"/>
        </radialGradient>
        {/* Rim top */}
        <radialGradient id="rt" cx="38%" cy="32%" r="68%">
          <stop offset="0%"   stopColor="#caa858"/>
          <stop offset="55%"  stopColor="#907020"/>
          <stop offset="100%" stopColor="#584008"/>
        </radialGradient>
        {/* Ground */}
        <radialGradient id="gr" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#988058"/>
          <stop offset="55%"  stopColor="#706030"/>
          <stop offset="100%" stopColor="#403818"/>
        </radialGradient>
        {/* Atmosphere */}
        <radialGradient id="ag" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1E5DA8" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
        <filter id="gf"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="wf"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sf"><feGaussianBlur stdDeviation="1.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <clipPath id="bc"><rect x="75" y="95" width="250" height="220" rx="2"/></clipPath>
      </defs>

      {/* ── GROUND ATMOSPHERE ── */}
      <ellipse cx="200" cy="370" rx="185" ry="32" fill="url(#ag)"/>
      <ellipse cx="200" cy="368" rx="165" ry="22" fill="rgba(0,0,0,.5)"/>

      {/* ── RUNE PLATFORM ── */}
      <ellipse cx="200" cy="358" rx="172" ry="24" fill="#18100a"/>
      <ellipse cx="200" cy="356" rx="170" ry="22" fill="#281808"/>
      <ellipse cx="200" cy="354" rx="168" ry="21" fill="#38220e"/>
      <ellipse cx="200" cy="352" rx="165" ry="20" fill="url(#gr)"/>
      {/* Cracks in platform */}
      <g stroke="rgba(0,0,0,.5)" strokeWidth="1.3" fill="none">
        <path d="M88,354 Q118,349 142,355 Q158,358 170,352"/>
        <path d="M228,353 Q250,349 272,354 Q288,358 310,352"/>
        <path d="M145,360 Q162,356 178,361"/>
        <path d="M218,360 Q234,356 248,360"/>
      </g>
      {/* Rune ring */}
      <ellipse cx="200" cy="352" rx="162" ry="19" fill="none"
        stroke="rgba(190,145,40,.45)" strokeWidth="2" strokeDasharray="9,7"/>
      <ellipse cx="200" cy="352" rx="144" ry="17" fill="none"
        stroke="rgba(180,135,35,.28)" strokeWidth="1"/>
      {/* Rune symbols */}
      {["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᚷ","ᚹ","ᚺ","ᚾ","ᛁ","ᛃ","ᛇ","ᛈ","ᛉ","ᛊ","ᛏ","ᛒ"].map((r,i)=>{
        const a=(i/18)*Math.PI*2-Math.PI/2;
        const x=200+154*Math.cos(a), y=352+18*Math.sin(a);
        return <text key={i} x={x} y={y+4} textAnchor="middle" fontFamily="serif"
          fontSize="12" fill="rgba(205,165,55,.68)"
          transform={`rotate(${(i/18)*360},${x},${y})`}>{r}</text>;
      })}
      {/* Glow dots on rune ring */}
      {[...Array(12)].map((_,i)=>{
        const a=(i/12)*Math.PI*2;
        return <circle key={i} cx={200+163*Math.cos(a)} cy={352+20*Math.sin(a)}
          r="3.5" fill="#FFCC44" opacity=".88" filter="url(#gf)"/>;
      })}

      {/* ── BASE RAISED RING ── */}
      <ellipse cx="200" cy="326" rx="140" ry="24" fill="#180e06"/>
      <ellipse cx="200" cy="324" rx="138" ry="23" fill="#302010"/>
      <ellipse cx="200" cy="322" rx="136" ry="22" fill="#4a3215"/>
      <ellipse cx="200" cy="320" rx="134" ry="21" fill="#654520"/>
      <ellipse cx="200" cy="318" rx="132" ry="20" fill="#806030"/>
      {/* Heavy moss on base */}
      <ellipse cx="112" cy="316" rx="26" ry="8"   fill="url(#mg)" opacity=".95" filter="url(#sf)"/>
      <ellipse cx="292" cy="315" rx="22" ry="7.5" fill="url(#mg)" opacity=".88" filter="url(#sf)"/>
      <ellipse cx="170" cy="321" rx="17" ry="6"   fill="url(#mg)" opacity=".82" filter="url(#sf)"/>
      <ellipse cx="238" cy="320" rx="15" ry="5.5" fill="url(#mg)" opacity=".75" filter="url(#sf)"/>

      {/* ══════════════════════════════════
          STONE BARREL — 6 rows of irregular
          medieval stone blocks. Each stone
          drawn as a slightly irregular poly.
      ══════════════════════════════════ */}

      {/* ROW 6 — BOTTOM */}
      <rect x="78" y="282" width="244" height="28" rx="1" fill="#1a0e06"/>
      {/* Individual stones — irregular shapes */}
      <polygon points="79,283 103,281 106,309 80,310" fill="url(#s4)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="107,282 141,280 144,309 109,310" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="145,283 178,281 180,309 147,310" fill="url(#s4)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="181,282 212,280 214,309 183,310" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="215,283 248,281 250,309 217,310" fill="url(#s4)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="251,282 282,280 284,309 253,310" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="285,283 318,282 318,309 287,310" fill="url(#s4)" stroke="#0e0804" strokeWidth="0.8"/>
      {/* Mortar shadow lines */}
      <line x1="107" y1="280" x2="109" y2="310" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="145" y1="281" x2="147" y2="310" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="181" y1="280" x2="183" y2="310" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="215" y1="281" x2="217" y2="310" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="251" y1="280" x2="253" y2="310" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="285" y1="281" x2="287" y2="310" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      {/* Stone top highlights */}
      <line x1="79" y1="283" x2="103" y2="281" stroke="rgba(220,185,100,.32)" strokeWidth="1.5"/>
      <line x1="145" y1="283" x2="178" y2="281" stroke="rgba(220,185,100,.28)" strokeWidth="1.5"/>
      <line x1="215" y1="283" x2="248" y2="281" stroke="rgba(220,185,100,.3)" strokeWidth="1.5"/>
      {/* Moss */}
      <ellipse cx="124" cy="282" rx="14" ry="5" fill="url(#mg)" opacity=".85" filter="url(#sf)"/>
      <ellipse cx="270" cy="281" rx="12" ry="4.5" fill="url(#mg)" opacity=".75" filter="url(#sf)"/>

      {/* ROW 5 */}
      <rect x="76" y="252" width="248" height="30" rx="1" fill="#200e06"/>
      <polygon points="77,253 115,251 118,282 79,283" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="119,252 155,250 158,282 121,283" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="159,253 188,251 190,282 161,283" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="191,252 224,250 226,282 193,283" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="227,253 260,251 262,282 229,283" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="263,252 295,250 297,282 265,283" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="298,253 322,253 322,282 300,283" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <line x1="119" y1="250" x2="121" y2="283" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="159" y1="251" x2="161" y2="283" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="191" y1="250" x2="193" y2="283" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="227" y1="251" x2="229" y2="283" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="263" y1="250" x2="265" y2="283" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="298" y1="251" x2="300" y2="283" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="77" y1="253" x2="115" y2="251" stroke="rgba(220,185,100,.35)" strokeWidth="1.8"/>
      <line x1="159" y1="253" x2="188" y2="251" stroke="rgba(220,185,100,.32)" strokeWidth="1.5"/>
      <line x1="227" y1="253" x2="260" y2="251" stroke="rgba(220,185,100,.3)" strokeWidth="1.5"/>
      <ellipse cx="175" cy="252" rx="20" ry="6.5" fill="url(#mg)" opacity=".9" filter="url(#sf)"/>
      <ellipse cx="88"  cy="252" rx="12" ry="4.5" fill="url(#mg)" opacity=".7" filter="url(#sf)"/>
      <ellipse cx="306" cy="253" rx="14" ry="5" fill="url(#mg)" opacity=".78" filter="url(#sf)"/>

      {/* ROW 4 */}
      <rect x="76" y="222" width="248" height="30" rx="1" fill="#180e06"/>
      <polygon points="77,223 110,221 113,252 79,253" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="114,222 150,220 153,252 116,253" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="154,223 182,221 184,252 156,253" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="185,222 218,220 220,252 187,253" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="221,223 256,221 258,252 223,253" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="259,222 290,220 292,252 261,253" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="293,223 322,224 322,252 295,253" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <line x1="114" y1="220" x2="116" y2="253" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="154" y1="221" x2="156" y2="253" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="185" y1="220" x2="187" y2="253" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="221" y1="221" x2="223" y2="253" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="259" y1="220" x2="261" y2="253" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="293" y1="221" x2="295" y2="253" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="77" y1="223" x2="110" y2="221" stroke="rgba(220,185,100,.4)" strokeWidth="2"/>
      <line x1="114" y1="222" x2="150" y2="220" stroke="rgba(220,185,100,.38)" strokeWidth="2"/>
      <line x1="185" y1="222" x2="218" y2="220" stroke="rgba(220,185,100,.35)" strokeWidth="2"/>
      <line x1="259" y1="222" x2="290" y2="220" stroke="rgba(220,185,100,.32)" strokeWidth="1.8"/>
      <ellipse cx="96"  cy="222" rx="18" ry="6" fill="url(#mg)" opacity=".88" filter="url(#sf)"/>
      <ellipse cx="272" cy="221" rx="22" ry="7" fill="url(#mg)" opacity=".92" filter="url(#sf)"/>
      <ellipse cx="200" cy="222" rx="16" ry="5.5" fill="url(#mg)" opacity=".7" filter="url(#sf)"/>

      {/* ROW 3 */}
      <rect x="76" y="192" width="248" height="30" rx="1" fill="#200e06"/>
      <polygon points="77,193 118,191 120,222 79,223" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="121,192 158,190 160,222 123,223" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="161,193 192,191 194,222 163,223" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="195,192 226,190 228,222 197,223" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="229,193 262,191 264,222 231,223" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="265,192 298,190 300,222 267,223" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="301,193 322,194 322,222 303,223" fill="url(#s3)" stroke="#0e0804" strokeWidth="0.8"/>
      <line x1="121" y1="190" x2="123" y2="223" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="161" y1="191" x2="163" y2="223" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="195" y1="190" x2="197" y2="223" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="229" y1="191" x2="231" y2="223" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="265" y1="190" x2="267" y2="223" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="301" y1="191" x2="303" y2="223" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="77" y1="193" x2="118" y2="191" stroke="rgba(220,185,100,.42)" strokeWidth="2"/>
      <line x1="121" y1="192" x2="158" y2="190" stroke="rgba(220,185,100,.38)" strokeWidth="2"/>
      <line x1="161" y1="193" x2="192" y2="191" stroke="rgba(220,185,100,.4)" strokeWidth="2"/>
      <line x1="195" y1="192" x2="226" y2="190" stroke="rgba(220,185,100,.36)" strokeWidth="1.8"/>
      <line x1="229" y1="193" x2="262" y2="191" stroke="rgba(220,185,100,.38)" strokeWidth="2"/>
      <ellipse cx="148" cy="192" rx="22" ry="7" fill="url(#mg)" opacity=".92" filter="url(#sf)"/>
      <ellipse cx="248" cy="191" rx="18" ry="6.5" fill="url(#mg)" opacity=".85" filter="url(#sf)"/>
      <ellipse cx="88"  cy="193" rx="12" ry="4.5" fill="url(#mg)" opacity=".68" filter="url(#sf)"/>

      {/* ROW 2 */}
      <rect x="76" y="162" width="248" height="30" rx="1" fill="#180e06"/>
      <polygon points="77,163 112,161 114,192 79,193" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="115,162 152,160 154,192 117,193" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="155,163 186,161 188,192 157,193" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="189,162 222,160 224,192 191,193" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="225,163 258,161 260,192 227,193" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="261,162 294,160 296,192 263,193" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="297,163 322,164 322,192 299,193" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <line x1="115" y1="160" x2="117" y2="193" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="155" y1="161" x2="157" y2="193" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="189" y1="160" x2="191" y2="193" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="225" y1="161" x2="227" y2="193" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="261" y1="160" x2="263" y2="193" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="297" y1="161" x2="299" y2="193" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="77"  y1="163" x2="112" y2="161" stroke="rgba(220,185,100,.42)" strokeWidth="2"/>
      <line x1="115" y1="162" x2="152" y2="160" stroke="rgba(220,185,100,.45)" strokeWidth="2.2"/>
      <line x1="155" y1="163" x2="186" y2="161" stroke="rgba(220,185,100,.4)" strokeWidth="2"/>
      <line x1="189" y1="162" x2="222" y2="160" stroke="rgba(220,185,100,.42)" strokeWidth="2"/>
      <line x1="225" y1="163" x2="258" y2="161" stroke="rgba(220,185,100,.38)" strokeWidth="2"/>
      <line x1="261" y1="162" x2="294" y2="160" stroke="rgba(220,185,100,.4)" strokeWidth="2"/>
      <ellipse cx="95"  cy="162" rx="20" ry="7" fill="url(#mg)" opacity=".9" filter="url(#sf)"/>
      <ellipse cx="308" cy="161" rx="16" ry="6" fill="url(#mg)" opacity=".82" filter="url(#sf)"/>
      <ellipse cx="220" cy="161" rx="20" ry="6.5" fill="url(#mg)" opacity=".88" filter="url(#sf)"/>

      {/* ROW 1 — TOP, brightest */}
      <rect x="76" y="132" width="248" height="30" rx="1" fill="#1e1008"/>
      <polygon points="77,133 120,131 122,162 79,163" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="123,132 162,130 164,162 125,163" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="165,133 198,131 200,162 167,163" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="201,132 236,130 238,162 203,163" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="239,133 272,131 274,162 241,163" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="275,132 310,130 312,162 277,163" fill="url(#s2)" stroke="#0e0804" strokeWidth="0.8"/>
      <polygon points="313,133 322,134 322,162 315,163" fill="url(#s1)" stroke="#0e0804" strokeWidth="0.8"/>
      <line x1="123" y1="130" x2="125" y2="163" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="165" y1="131" x2="167" y2="163" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="201" y1="130" x2="203" y2="163" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="239" y1="131" x2="241" y2="163" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="275" y1="130" x2="277" y2="163" stroke="rgba(0,0,0,.5)" strokeWidth="1.5"/>
      <line x1="313" y1="131" x2="315" y2="163" stroke="rgba(0,0,0,.6)" strokeWidth="1.5"/>
      <line x1="77"  y1="133" x2="120" y2="131" stroke="rgba(230,195,110,.48)" strokeWidth="2.5"/>
      <line x1="123" y1="132" x2="162" y2="130" stroke="rgba(230,195,110,.5)"  strokeWidth="2.5"/>
      <line x1="165" y1="133" x2="198" y2="131" stroke="rgba(230,195,110,.45)" strokeWidth="2.5"/>
      <line x1="201" y1="132" x2="236" y2="130" stroke="rgba(230,195,110,.48)" strokeWidth="2.5"/>
      <line x1="239" y1="133" x2="272" y2="131" stroke="rgba(230,195,110,.45)" strokeWidth="2.5"/>
      <line x1="275" y1="132" x2="310" y2="130" stroke="rgba(230,195,110,.42)" strokeWidth="2.5"/>
      {/* Heavy moss on top row */}
      <ellipse cx="150" cy="131" rx="30" ry="9.5" fill="url(#mg)" opacity=".96" filter="url(#sf)"/>
      <ellipse cx="262" cy="130" rx="26" ry="9"   fill="url(#mg)" opacity=".93" filter="url(#sf)"/>
      <ellipse cx="92"  cy="132" rx="18" ry="6.5" fill="url(#mg)" opacity=".85" filter="url(#sf)"/>
      <ellipse cx="310" cy="131" rx="16" ry="6"   fill="url(#mg)" opacity=".8" filter="url(#sf)"/>
      <ellipse cx="202" cy="130" rx="14" ry="5.5" fill="url(#mg)" opacity=".7" filter="url(#sf)"/>

      {/* ── CYLINDER DEPTH SHADING ── */}
      <rect x="76" y="132" width="55" height="178" fill="url(#cL)" clipPath="url(#bc)"/>
      <rect x="271" y="132" width="55" height="178" fill="url(#cR)" clipPath="url(#bc)"/>
      <rect x="76" y="132" width="248" height="178" fill="url(#cC)" clipPath="url(#bc)"/>

      {/* ── TOP RIM — thick elliptical stone ── */}
      <ellipse cx="200" cy="140" rx="138" ry="28" fill="rgba(0,0,0,.65)"/>
      <ellipse cx="200" cy="137" rx="136" ry="27" fill="#150c04"/>
      <ellipse cx="200" cy="135" rx="134" ry="26" fill="#2e1c08"/>
      <ellipse cx="200" cy="133" rx="132" ry="25" fill="#4a2e10"/>
      <ellipse cx="200" cy="131" rx="130" ry="24" fill="#6a4818"/>
      <ellipse cx="200" cy="129" rx="128" ry="23" fill="url(#rt)"/>
      {/* Rim specular highlight */}
      <ellipse cx="176" cy="124" rx="52" ry="9" fill="rgba(230,200,120,.3)"/>
      <ellipse cx="162" cy="122" rx="24" ry="5" fill="rgba(245,215,145,.25)"/>
      {/* Rim border */}
      <ellipse cx="200" cy="129" rx="128" ry="23" fill="none"
        stroke="rgba(185,145,55,.5)" strokeWidth="1.5"/>
      {/* Heavy moss on rim — signature look of the well */}
      <ellipse cx="125" cy="126" rx="30" ry="10"  fill="url(#mg)" opacity=".96" filter="url(#sf)"/>
      <ellipse cx="284" cy="125" rx="26" ry="9.5" fill="url(#mg)" opacity=".93" filter="url(#sf)"/>
      <ellipse cx="202" cy="120" rx="20" ry="8"   fill="url(#mg)" opacity=".75" filter="url(#sf)"/>
      <ellipse cx="160" cy="128" rx="15" ry="6"   fill="url(#mg)" opacity=".7" filter="url(#sf)"/>
      <ellipse cx="248" cy="127" rx="17" ry="6.5" fill="url(#mg)" opacity=".78" filter="url(#sf)"/>

      {/* ── INTERIOR ── */}
      <ellipse cx="200" cy="129" rx="120" ry="21" fill="#04060e"/>
      <ellipse cx="200" cy="129" rx="115" ry="19" fill="#060810"/>
      <ellipse cx="200" cy="130" rx="110" ry="18" fill="#080a12"/>

      {/* ── WATER SURFACE ── */}
      <ellipse cx="200" cy="130" rx="106" ry="16" fill="url(#wg)"/>
      <ellipse cx="178" cy="127" rx="36" ry="6.5" fill="rgba(210,248,255,.44)"/>
      <ellipse cx="222" cy="133" rx="28" ry="5"   fill="rgba(160,218,255,.32)"/>
      <ellipse cx="190" cy="133" rx="18" ry="3.5" fill="rgba(255,255,255,.2)"/>
      <ellipse cx="214" cy="127" rx="11" ry="2.5" fill="rgba(255,255,255,.24)"/>
      {glowing && (
        <ellipse cx="200" cy="130" rx="106" ry="16"
          fill="rgba(100,235,255,.68)" filter="url(#wf)"/>
      )}

      {/* ── LIGHT RAY (coin → water) ── */}
      <polygon points="188,0 212,0 220,130 180,130" fill="rgba(255,220,80,.055)"/>
      <polygon points="193,0 207,0 212,130 188,130" fill="rgba(255,220,80,.04)"/>

      {/* ── SPARKLES ── */}
      {[[62,108],[338,100],[128,80],[278,85],[200,62],[48,172],[352,160],[85,136],[318,130]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="3"
          fill={i%3===0?"#FFD050":i%3===1?"#88d8ff":"#FFE080"}
          opacity=".88" filter="url(#gf)"/>
      ))}
    </svg>
  );
}


/* ── Draggable yellow-gold coin ── */
function YellowCoin({ size=86 }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ycB" cx="36%" cy="30%" r="68%">
          <stop offset="0%"   stopColor="#fff9c0"/>
          <stop offset="12%"  stopColor="#FFE800"/>
          <stop offset="35%"  stopColor="#FFC800"/>
          <stop offset="60%"  stopColor="#E8A800"/>
          <stop offset="82%"  stopColor="#C88800"/>
          <stop offset="100%" stopColor="#8a5800"/>
        </radialGradient>
        <radialGradient id="ycS" cx="30%" cy="25%" r="45%">
          <stop offset="0%"   stopColor="rgba(255,255,200,.75)"/>
          <stop offset="100%" stopColor="rgba(255,255,0,0)"/>
        </radialGradient>
        <radialGradient id="ycE" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,230,0,.25)"/>
          <stop offset="100%" stopColor="rgba(255,180,0,0)"/>
        </radialGradient>
        <filter id="ycGlw">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <clipPath id="ycCl"><circle cx="50" cy="50" r="44"/></clipPath>
        <path id="ycArc" d="M50,50 m-28,0 a28,28 0 0,1 56,0"/>
      </defs>

      {/* Outer glow */}
      <circle cx="50" cy="50" r="49" fill="url(#ycE)" filter="url(#ycGlw)"/>

      {/* Rim layers */}
      <circle cx="50" cy="50" r="47" fill="#6a3a00"/>
      <circle cx="50" cy="50" r="45" fill="#C88800"/>
      <circle cx="50" cy="50" r="43" fill="#FFD700"/>
      <circle cx="50" cy="50" r="41" fill="#C88800"/>

      {/* Coin face */}
      <circle cx="50" cy="50" r="39" fill="url(#ycB)" clipPath="url(#ycCl)"/>

      {/* Inner ring */}
      <circle cx="50" cy="50" r="32" fill="none" stroke="#C88800" strokeWidth="1.5"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(255,255,0,.3)" strokeWidth="0.8"/>

      {/* "6-7 WISH" arc text */}
      <text fontFamily="Arial Black,sans-serif" fontSize="7" fontWeight="900" fill="#6a3a00" letterSpacing="1.8">
        <textPath href="#ycArc" startOffset="4%">6-7  W I S H</textPath>
      </text>
      <text fontFamily="Arial Black,sans-serif" fontSize="7" fontWeight="900" fill="rgba(255,255,180,.6)" letterSpacing="1.8">
        <textPath href="#ycArc" startOffset="4%">6-7  W I S H</textPath>
      </text>

      {/* Center star/badge */}
      <circle cx="50" cy="53" r="14" fill="#C88800" opacity=".4"/>
      <text x="50" y="58" fontFamily="Arial Black,sans-serif" fontSize="18" fontWeight="900"
            fill="#6a3a00" textAnchor="middle" opacity=".8">★</text>
      <text x="50" y="57" fontFamily="Arial Black,sans-serif" fontSize="18" fontWeight="900"
            fill="#FFE800" textAnchor="middle">★</text>

      {/* Shine */}
      <circle cx="50" cy="50" r="39" fill="url(#ycS)" clipPath="url(#ycCl)"/>

      {/* Rim dots */}
      {[0,60,120,180,240,300].map((deg,i)=>(
        <circle key={i}
          cx={50+43*Math.cos(deg*Math.PI/180)}
          cy={50+43*Math.sin(deg*Math.PI/180)}
          r="1.5" fill="#FFE800" opacity=".9"/>
      ))}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════
   PAYPAL POPUP — loads real PayPal SDK dynamically
   Client ID: ENfnaFThD2nf0YoiyfzhhiavBXa7UPHhcqgqqEs5e3-SNWFM0MMisIanP2-Z9vD1HErX7GL_wl_JRzUZ
   Business:  isradelx@gmail.com
   Return:    https://www.sixsevenwish.com/gracias.html
   Cancel:    https://www.sixsevenwish.com/payment-cancelled.html
════════════════════════════════════════════════════════ */
const PP_CLIENT_ID = "ENfnaFThD2nf0YoiyfzhhiavBXa7UPHhcqgqqEs5e3-SNWFM0MMisIanP2-Z9vD1HErX7GL_wl_JRzUZ";
const PP_EMAIL     = "isradelx@gmail.com";

function PayPalPopup({ level, name, wish, onSuccess, onBack }) {
  const containerRef = useRef(null);
  const [sdkStatus, setSdkStatus] = useState("loading"); // loading | ready | error
  const [processing, setProcessing] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    if (!level) return;

    // Remove any existing PayPal script to avoid conflicts
    const existingScript = document.querySelector('script[data-pp-sdk]');
    if (existingScript) existingScript.remove();

    // Remove existing PayPal buttons container content
    if (containerRef.current) containerRef.current.innerHTML = "";
    rendered.current = false;

    // Load PayPal SDK
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PP_CLIENT_ID}&currency=USD&intent=capture&components=buttons&disable-funding=credit,card`;
    script.setAttribute("data-pp-sdk", "true");
    script.setAttribute("data-namespace", "paypal_sdk");

    script.onload = () => {
      setSdkStatus("ready");
      if (!window.paypal || rendered.current) return;
      rendered.current = true;

      window.paypal.Buttons({
        style: {
          shape:  "rect",
          color:  "gold",
          layout: "vertical",
          label:  "pay",
          height: 50,
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [{
              payee:  { email_address: PP_EMAIL },
              amount: { value: level.amount.toFixed(2), currency_code: "USD" },
              description: `6-7 Wish — ${level.name} ($${level.amount.toFixed(2)})`,
              custom_id: level.id,
            }],
            application_context: {
              brand_name:          "6-7 Wish by Milkox Group LLC",
              landing_page:        "BILLING",
              user_action:         "PAY_NOW",
              shipping_preference: "NO_SHIPPING",
            },
          });
        },
        onApprove: (data, actions) => {
          setProcessing(true);
          return actions.order.capture().then((details) => {
            // Save to backend (non-blocking)
            const fd = new FormData();
            fd.append("first_name", name.split(" ")[0] || name);
            fd.append("last_name",  name.split(" ").slice(1).join(" ") || "");
            fd.append("wish_text",  wish);
            fd.append("wish_level", level.id);
            fd.append("amount",     level.amount.toFixed(2));
            fd.append("paypal_transaction_id", details.id);
            fd.append("status",     details.status);
            fetch("/api/save-wish.php", { method:"POST", body:fd })
              .catch(()=>{});
            // Redirect to success page
            window.location.href = `https://www.sixsevenwish.com/gracias.html?txn=${details.id}&level=${level.id}&amount=${level.amount}`;
          }).catch(() => {
            setProcessing(false);
            setSdkStatus("error");
          });
        },
        onCancel: () => {
          window.location.href = "https://www.sixsevenwish.com/payment-cancelled.html?reason=cancelled";
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          setSdkStatus("error");
        },
      }).render(containerRef.current);
    };

    script.onerror = () => setSdkStatus("error");
    document.head.appendChild(script);

    return () => {
      // cleanup on unmount
      rendered.current = false;
    };
  }, [level]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,
      background:"rgba(6,14,34,.95)",backdropFilter:"blur(14px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
      <div style={{
        background:"linear-gradient(135deg,#0c1a3a,#172e6a)",
        border:"2px solid #D4AF37",borderRadius:"22px",
        padding:"2rem 1.6rem",maxWidth:"390px",width:"100%",textAlign:"center",
        boxShadow:"0 0 80px rgba(212,175,55,.42)",
        animation:"pi .48s cubic-bezier(.34,1.56,.64,1)",
        position:"relative",
      }}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",
          background:"linear-gradient(90deg,transparent,#FFD700,transparent)",
          borderRadius:"22px 22px 0 0"}}/>

        {processing ? (
          /* Processing overlay */
          <div style={{padding:"1.5rem 0"}}>
            <div style={{fontSize:"2.5rem",marginBottom:".7rem",animation:"lf 1s ease-in-out infinite"}}>🪙</div>
            <p style={{color:"#FFD700",fontFamily:"Georgia,serif",fontSize:".95rem",
              letterSpacing:"2px",textTransform:"uppercase",animation:"sh 1s ease-in-out infinite"}}>
              Processing your wish…
            </p>
            <p style={{color:"rgba(255,255,255,.45)",fontSize:".8rem",marginTop:".5rem"}}>
              Please do not close this window
            </p>
          </div>
        ) : (
          <>
            <div style={{fontSize:"2.3rem",marginBottom:".5rem"}}>🪙</div>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.15rem",fontWeight:900,
              color:"#FFD700",marginBottom:".45rem",lineHeight:1.3}}>
              Complete Your Wish
            </h2>
            <p style={{color:"rgba(255,255,255,.72)",fontStyle:"italic",
              fontSize:".86rem",lineHeight:1.6,marginBottom:".9rem"}}>
              The well has accepted your wish.<br/>Complete your contribution to seal it forever.
            </p>

            {/* Amount badge */}
            <div style={{background:"rgba(212,175,55,.12)",border:"1px solid rgba(212,175,55,.4)",
              borderRadius:"11px",padding:".7rem 1rem",marginBottom:"1.1rem",
              fontFamily:"Georgia,serif",fontSize:".88rem",color:"#FFD700",
              letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:900}}>
              ✦ {level?.name} — ${level?.amount}.00 ✦
            </div>

            {/* PayPal SDK container */}
            {sdkStatus === "loading" && (
              <div style={{
                background:"rgba(255,196,57,.08)",border:"1px dashed rgba(255,196,57,.3)",
                borderRadius:"10px",padding:"1.2rem",marginBottom:"1rem",
                color:"rgba(255,196,57,.7)",fontSize:".82rem",letterSpacing:"1.5px",
                textTransform:"uppercase",animation:"sh 1.5s ease-in-out infinite",
              }}>
                ⏳ Loading PayPal…
              </div>
            )}

            {sdkStatus === "error" && (
              <div style={{
                background:"rgba(255,80,80,.08)",border:"1px solid rgba(255,80,80,.3)",
                borderRadius:"10px",padding:"1rem",marginBottom:"1rem",
                color:"#ff6b6b",fontSize:".82rem",lineHeight:1.6,
              }}>
                ⚠️ PayPal could not load.<br/>
                <span style={{fontSize:".75rem",color:"rgba(255,255,255,.45)"}}>
                  This preview runs in a sandboxed environment.<br/>
                  On your live site at <strong style={{color:"#FFD700"}}>sixsevenwish.com</strong> PayPal will work correctly.
                </span>
              </div>
            )}

            {/* PayPal renders here */}
            <div ref={containerRef} style={{marginBottom:"1rem",minHeight:sdkStatus==="ready"?"52px":"0"}}/>

            <p style={{fontSize:".66rem",color:"rgba(255,255,255,.25)",lineHeight:1.55,marginBottom:".8rem"}}>
              By completing, you agree to our Terms of Service.<br/>
              Digital entertainment only. All sales final.
            </p>

            <button onClick={onBack}
              style={{background:"transparent",border:"none",color:"rgba(212,175,55,.45)",
                fontFamily:"Georgia,serif",fontSize:".7rem",cursor:"pointer",
                textDecoration:"underline",letterSpacing:"1px"}}>
              ← Edit my wish
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════ */
export default function App() {
  const [step,      setStep]      = useState(STEPS.WELL);
  const [level,     setLevel]     = useState(null);
  const [name,      setName]      = useState("");
  const [wish,      setWish]      = useState("");
  const [coinPos,   setCoinPos]   = useState({x:0,y:0});
  const [coinOp,    setCoinOp]    = useState(1);
  const [coinScale, setCoinScale] = useState(1);
  const [glowing,   setGlowing]   = useState(false);
  const [particles, setParticles] = useState([]);
  const [floatY,    setFloatY]    = useState(0);
  const [logoPulse, setLogoPulse] = useState(false);
  const [flash,     setFlash]     = useState(false);

  const isDragging = useRef(false);
  const dragStart  = useRef({mx:0,my:0,cx:0,cy:0});
  const wellRef    = useRef(null);
  const coinRef    = useRef(null);
  const floatT     = useRef(0);
  const floatAF    = useRef(null);

  /* ── Idle float ── */
  useEffect(()=>{
    if(step!==STEPS.WELL) return;
    const loop=()=>{
      floatT.current+=0.025;
      setFloatY(Math.sin(floatT.current)*11);
      floatAF.current=requestAnimationFrame(loop);
    };
    floatAF.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(floatAF.current);
  },[step]);

  /* ── Well mouth position ── */
  const getWellMouth=()=>{
    if(!wellRef.current) return{x:0,y:0};
    const r=wellRef.current.getBoundingClientRect();
    return{x:r.left+r.width*.5, y:r.top+r.height*.37};
  };
  const getCoinCenter=()=>{
    if(!coinRef.current) return{x:0,y:0};
    const r=coinRef.current.getBoundingClientRect();
    return{x:r.left+r.width/2, y:r.top+r.height/2};
  };

  /* ── DRAG START ── */
  const startDrag=useCallback((cx,cy)=>{
    if(step!==STEPS.WELL) return;
    cancelAnimationFrame(floatAF.current);
    isDragging.current=true;
    dragStart.current={mx:cx, my:cy, cx:coinPos.x, cy:coinPos.y};
  },[step,coinPos]);

  /* ── DRAG MOVE ── */
  const moveDrag=useCallback((cx,cy)=>{
    if(!isDragging.current) return;
    setCoinPos({
      x:dragStart.current.cx+(cx-dragStart.current.mx),
      y:dragStart.current.cy+(cy-dragStart.current.my),
    });
  },[]);

  /* ── DRAG END ── */
  const endDrag=useCallback((cx,cy)=>{
    if(!isDragging.current) return;
    isDragging.current=false;
    const wm=getWellMouth(), cc=getCoinCenter();
    const dist=Math.hypot(cc.x-wm.x, cc.y-wm.y);
    if(dist<115){
      dropCoinAnimation();
    } else {
      // Return to home
      setCoinPos({x:0,y:0});
      floatT.current=0;
    }
  },[]);

  /* Mouse */
  const onMD=useCallback(e=>{e.preventDefault();startDrag(e.clientX,e.clientY);},[startDrag]);
  const onMM=useCallback(e=>moveDrag(e.clientX,e.clientY),[moveDrag]);
  const onMU=useCallback(e=>endDrag(e.clientX,e.clientY),[endDrag]);
  /* Touch */
  const onTS=useCallback(e=>{e.preventDefault();const t=e.touches[0];startDrag(t.clientX,t.clientY);},[startDrag]);
  const onTM=useCallback(e=>{e.preventDefault();const t=e.touches[0];moveDrag(t.clientX,t.clientY);},[moveDrag]);
  const onTE=useCallback(e=>{e.preventDefault();const t=e.changedTouches[0];endDrag(t.clientX,t.clientY);},[endDrag]);

  useEffect(()=>{
    window.addEventListener("mousemove",onMM);
    window.addEventListener("mouseup",onMU);
    return()=>{window.removeEventListener("mousemove",onMM);window.removeEventListener("mouseup",onMU);};
  },[onMM,onMU]);

  /* ── COIN DROP ANIMATION → then show buy popup ── */
  const dropCoinAnimation=()=>{
    setStep(STEPS.DROPPING);
    let p=0;
    const iv=setInterval(()=>{
      p+=0.08;
      setCoinOp(Math.max(0,1-p));
      setCoinScale(Math.max(0.05,1-p*0.9));
      setCoinPos(prev=>({x:prev.x*.85,y:prev.y+8}));
      if(p>=1){
        clearInterval(iv);
        // Flash effect
        setFlash(true);
        setTimeout(()=>setFlash(false),350);
        setGlowing(true);
        // Burst particles
        setParticles(Array.from({length:28},(_,i)=>({
          id:i, angle:(i/28)*Math.PI*2,
          dist:50+Math.random()*90,
          color:Math.random()>.45?"#FFD700":"#60d4ff",
          size:3+Math.random()*5,
        })));
        setTimeout(()=>setParticles([]),1400);
        setTimeout(()=>setLogoPulse(true),200);
        setTimeout(()=>setLogoPulse(false),900);
        // Show buy popup after magic
        setTimeout(()=>{
          setGlowing(false);
          setStep(STEPS.BUY_POPUP);
        },1800);
      }
    },16);
  };

  /* ── GRANTED → reset ── */
  const resetScene=()=>{
    setStep(STEPS.WELL);
    setCoinPos({x:0,y:0}); setCoinOp(1); setCoinScale(1);
    setGlowing(false); setName(""); setWish(""); setLevel(null);
    setParticles([]); floatT.current=0;
  };

  const coinShow = step===STEPS.WELL||step===STEPS.DROPPING;
  const canGoToPayPal = name.trim().length>1 && wish.trim().length>4 && level!==null;

  return (
    <div
      style={{minHeight:"100dvh",background:"radial-gradient(ellipse at 50% 0%,#1a3a7a 0%,#0D1B3D 40%,#060E22 100%)",fontFamily:"Georgia,serif",overflowX:"hidden",position:"relative",display:"flex",flexDirection:"column"}}
    >
      <style>{`
        *{box-sizing:border-box;}
        @keyframes tw{0%,100%{opacity:.12}50%{opacity:.88}}
        @keyframes lf{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes sh{0%,100%{opacity:.55}50%{opacity:1}}
        @keyframes pi{from{transform:scale(.6) translateY(18px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}
        @keyframes pb{0%,100%{box-shadow:0 0 0 0 rgba(255,215,0,.85),0 4px 22px rgba(255,200,0,.5)}55%{box-shadow:0 0 0 16px rgba(255,215,0,0),0 4px 32px rgba(255,215,0,.75)}}
        @keyframes gr{0%{opacity:0;transform:scale(.45)}65%{transform:scale(1.07)}100%{opacity:1;transform:scale(1)}}
        @keyframes br{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:var(--tp) scale(.1)}}
        @keyframes fl{0%{opacity:.9}100%{opacity:0}}
        input,textarea{display:block;width:100%;background:rgba(6,14,34,.88);border:1.5px solid rgba(212,175,55,.38);border-radius:9px;color:#fff;font-family:Georgia,serif;font-size:.92rem;padding:.65rem .92rem;outline:none;margin-bottom:.55rem;transition:border-color .2s;}
        input:focus,textarea:focus{border-color:#FFD700;}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,.28);font-style:italic;}
        textarea{resize:none;line-height:1.52;}
      `}</style>

      {/* ── Flash overlay ── */}
      {flash && (
        <div style={{position:"fixed",inset:0,zIndex:500,background:"radial-gradient(circle at 50% 45%,rgba(255,215,0,.7),rgba(212,175,55,.3),transparent 70%)",pointerEvents:"none",animation:"fl .35s ease-out forwards"}}/>
      )}

      {/* ── Stars ── */}
      {[...Array(70)].map((_,i)=>(
        <div key={i} style={{position:"fixed",borderRadius:"50%",background:"#FFD700",
          width:Math.random()*2+.7,height:Math.random()*2+.7,
          left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,
          opacity:Math.random()*.45+.1,pointerEvents:"none",
          animation:`tw ${2+Math.random()*4}s ease-in-out infinite`,
          animationDelay:`${Math.random()*5}s`}}/>
      ))}

      {/* ── Top gold border ── */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:50,height:"5px",
        background:"linear-gradient(90deg,transparent,#7a4c00,#C89A18,#FFD700,#FFE85A,#FFD700,#C89A18,#7a4c00,transparent)",
        boxShadow:"0 0 20px rgba(200,154,24,.75)"}}/>

      {/* ══════════════════════════════════
          HEADER — Logo + title only
      ══════════════════════════════════ */}
      <header style={{textAlign:"center",paddingTop:"15px",paddingBottom:"0",flexShrink:0,zIndex:10}}>
        <div style={{
          display:"inline-flex",alignItems:"center",justifyContent:"center",
          animation:"lf 3s ease-in-out infinite",
          transform:logoPulse?"scale(1.25)":"scale(1)",
          transition:"transform .5s cubic-bezier(.34,1.56,.64,1)",
        }}>
          <LogoCoin size={112} pulse={logoPulse}/>
        </div>
        <h1 style={{
          fontFamily:"Georgia,serif",
          fontSize:"clamp(1.2rem,4.5vw,1.9rem)",fontWeight:900,
          background:"linear-gradient(180deg,#fff9d0,#FFD700 40%,#B88A10)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
          margin:".28rem 0 .08rem",lineHeight:1.2,
          filter:"drop-shadow(0 0 10px rgba(212,175,55,.4))",
        }}>
          Your Wish Starts Here
        </h1>
        <p style={{color:"rgba(255,255,255,.58)",fontStyle:"italic",fontSize:"clamp(.72rem,2vw,.85rem)",margin:0,lineHeight:1.3}}>
          Drag the golden coin into the well
        </p>
      </header>

      <div style={{
        flex:"1 1 auto",
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        position:"relative",zIndex:10,
        paddingTop:"clamp(6px,2vh,24px)",
        paddingBottom:"clamp(6px,2vh,20px)",
        minHeight:"280px",
      }}>
        {/* Well + coin side by side */}
        <div style={{
          position:"relative",
          width:"min(420px,98vw)",
          margin:"0 auto",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
        }}>
          {/* Well SVG wrapper */}
          <div ref={wellRef} style={{
            position:"relative",
            width:"min(340px,82vw)",
            flexShrink:0,
            filter:glowing?"drop-shadow(0 0 32px rgba(80,210,255,.88))":"none",
            transition:"filter .4s",
          }}>
            <WellSVG glowing={glowing}/>

            {/* Burst particles — relative to well center */}
            {particles.map(p=>(
              <div key={p.id} style={{
                position:"absolute",left:"50%",top:"35%",
                width:`${p.size}px`,height:`${p.size}px`,
                borderRadius:"50%",
                background:p.color,
                boxShadow:`0 0 ${p.size*2}px ${p.color}`,
                pointerEvents:"none",
                "--tp":`translate(${Math.cos(p.angle)*p.dist}px,${Math.sin(p.angle)*p.dist}px)`,
                animation:"br 1.3s ease-out forwards",
              }}/>
            ))}
          </div>

          {/* ── COIN — to the RIGHT side, NOT above the well ── */}
          {coinShow && (
            <div
              ref={coinRef}
              onMouseDown={onMD}
              onTouchStart={onTS}
              onTouchMove={onTM}
              onTouchEnd={onTE}
              style={{
                position: isDragging.current||step===STEPS.DROPPING ? "absolute" : "relative",
                /* When idle: right of well, slightly up */
                marginLeft: isDragging.current||step===STEPS.DROPPING ? "0" : "-10px",
                marginTop: isDragging.current||step===STEPS.DROPPING ? "0" : "-40px",
                /* When dragging: absolute positioned by coinPos */
                left: isDragging.current||step===STEPS.DROPPING ? `calc(50% + ${coinPos.x}px)` : "auto",
                top:  isDragging.current||step===STEPS.DROPPING ? `calc(35% + ${coinPos.y}px)` : "auto",
                transform: step===STEPS.DROPPING
                  ? `translate(-50%,-50%) scale(${Math.max(0.05, coinOp)})`
                  : isDragging.current
                    ? "translate(-50%,-50%) scale(1.1)"
                    : `translateY(${floatY}px)`,
                cursor: isDragging.current ? "grabbing" : "grab",
                zIndex: 20,
                touchAction: "none",
                opacity: step===STEPS.DROPPING ? coinOp : 1,
                filter:"drop-shadow(0 0 22px rgba(255,220,0,1)) drop-shadow(-3px 5px 14px rgba(200,140,0,.65))",
                transition: isDragging.current||step===STEPS.DROPPING ? "none" : "margin .3s ease",
                flexShrink: 0,
              }}
            >
              <YellowCoin size={84}/>
            </div>
          )}
        </div>

        {/* Hint */}
        {step===STEPS.WELL && (
          <p style={{
            fontSize:".58rem",letterSpacing:"3px",textTransform:"uppercase",
            color:"rgba(212,175,55,.7)",marginTop:".35rem",
            textAlign:"center",animation:"sh 2.2s ease-in-out infinite",
          }}>
            ✦ Drag the coin into the well ✦
          </p>
        )}
        {step===STEPS.DROPPING && (
          <p style={{
            fontSize:".6rem",letterSpacing:"2px",textTransform:"uppercase",
            color:"rgba(100,220,255,.8)",marginTop:".3rem",
            textAlign:"center",animation:"sh .8s ease-in-out infinite",
          }}>
            ✦ Your wish is falling… ✦
          </p>
        )}
      </div>

      {/* ══════════════════════════════════
          POPUP 1: BUY / RECHARGE COINS
          Appears AFTER coin drops in well
      ══════════════════════════════════ */}
      {step===STEPS.BUY_POPUP && (
        <div style={{position:"fixed",inset:0,zIndex:300,
          background:"rgba(6,14,34,.94)",backdropFilter:"blur(14px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{
            background:"linear-gradient(135deg,#0c1a3a,#172e6a)",
            border:"2px solid #D4AF37",borderRadius:"22px",
            padding:"2rem 1.6rem",maxWidth:"370px",width:"100%",textAlign:"center",
            boxShadow:"0 0 80px rgba(212,175,55,.38),0 0 150px rgba(30,77,154,.32)",
            animation:"pi .48s cubic-bezier(.34,1.56,.64,1)",
            position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",
              background:"linear-gradient(90deg,transparent,#FFD700,transparent)",
              borderRadius:"22px 22px 0 0"}}/>

            {/* Coin emoji */}
            <div style={{fontSize:"2.8rem",marginBottom:".6rem",
              filter:"drop-shadow(0 0 16px rgba(255,215,0,.8))",
              animation:"lf 2s ease-in-out infinite"}}>🪙</div>

            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.22rem",fontWeight:900,
              color:"#FFD700",marginBottom:".55rem",lineHeight:1.25}}>
              Recharge Your Coins
            </h2>
            <p style={{color:"rgba(255,255,255,.75)",fontStyle:"italic",
              fontSize:".9rem",lineHeight:1.65,marginBottom:"1.2rem"}}>
              Choose your wish level to place your desire into the well of possibility.
            </p>

            {/* Level cards */}
            <div style={{display:"flex",flexDirection:"column",gap:".45rem",marginBottom:"1.3rem"}}>
              {LEVELS.map(lv=>(
                <div key={lv.id} onClick={()=>setLevel(lv)} style={{
                  background:level?.id===lv.id
                    ?"linear-gradient(135deg,rgba(13,27,61,.98),rgba(212,175,55,.22))"
                    :"rgba(255,255,255,.04)",
                  border:`2px solid ${level?.id===lv.id?"#FFD700":"rgba(212,175,55,.25)"}`,
                  borderRadius:"11px",padding:".65rem 1rem",
                  display:"flex",justifyContent:"space-between",alignItems:"center",
                  cursor:"pointer",transition:"all .22s",
                  boxShadow:level?.id===lv.id?"0 0 18px rgba(255,215,0,.35)":"none",
                }}>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontFamily:"Georgia,serif",fontSize:".75rem",letterSpacing:"1.5px",
                      textTransform:"uppercase",color:level?.id===lv.id?"#FFD700":"rgba(255,255,255,.6)"}}>{lv.name}</div>
                    <div style={{fontSize:".72rem",color:"rgba(255,255,255,.38)",fontStyle:"italic"}}>{lv.desc||""}</div>
                  </div>
                  <div style={{fontFamily:"Georgia,serif",fontSize:"1.5rem",fontWeight:900,
                    color:"#FFD700",filter:level?.id===lv.id?"drop-shadow(0 0 8px rgba(255,215,0,.7))":"none",
                    marginLeft:"1rem"}}>
                    ${lv.amount}
                  </div>
                  {level?.id===lv.id && (
                    <div style={{width:"20px",height:"20px",borderRadius:"50%",background:"#FFD700",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:".65rem",fontWeight:900,color:"#060E22",marginLeft:".5rem",flexShrink:0}}>✓</div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={()=>{ if(level) setStep(STEPS.FORM); }}
              style={{
                display:"block",width:"100%",padding:"1rem",
                background:level
                  ?"linear-gradient(135deg,#6a4200,#C89A18,#FFD700,#E8C030,#C89A18,#6a4200)"
                  :"rgba(60,60,60,.4)",
                border:`2px solid ${level?"#FFD700":"rgba(255,255,255,.1)"}`,
                borderRadius:"11px",
                color:level?"#060E22":"rgba(255,255,255,.25)",
                fontFamily:"Georgia,serif",fontSize:".9rem",fontWeight:900,
                letterSpacing:"2.5px",textTransform:"uppercase",
                cursor:level?"pointer":"not-allowed",
                animation:level?"pb 1.9s ease-in-out infinite":"none",
              }}>
              {level ? `✦ Continue — $${level.amount} ✦` : "Select a level first"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          POPUP 2: FORM (name + wish)
          PayPal ONLY shows when form ready
      ══════════════════════════════════ */}
      {step===STEPS.FORM && (
        <div style={{position:"fixed",inset:0,zIndex:300,
          background:"rgba(6,14,34,.94)",backdropFilter:"blur(14px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{
            background:"linear-gradient(135deg,#0c1a3a,#172e6a)",
            border:"2px solid #D4AF37",borderRadius:"22px",
            padding:"1.8rem 1.5rem",maxWidth:"390px",width:"100%",
            boxShadow:"0 0 80px rgba(212,175,55,.38)",
            animation:"pi .48s cubic-bezier(.34,1.56,.64,1)",
            position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",
              background:"linear-gradient(90deg,transparent,#FFD700,transparent)",
              borderRadius:"22px 22px 0 0"}}/>

            {/* Selected level badge */}
            <div style={{textAlign:"center",marginBottom:"1.1rem"}}>
              <span style={{display:"inline-block",background:"rgba(212,175,55,.12)",
                border:"1px solid rgba(212,175,55,.4)",borderRadius:"20px",
                padding:".3rem 1rem",fontFamily:"Georgia,serif",fontSize:".75rem",
                letterSpacing:"2px",textTransform:"uppercase",color:"#FFD700"}}>
                {level?.name} — ${level?.amount}
              </span>
            </div>

            <p style={{fontSize:".62rem",letterSpacing:"2px",textTransform:"uppercase",
              color:"#D4AF37",textAlign:"center",marginBottom:"1rem"}}>✦ Write Your Wish ✦</p>

            <label style={{display:"block",fontSize:".6rem",letterSpacing:"1.5px",
              textTransform:"uppercase",color:"rgba(212,175,55,.75)",marginBottom:".3rem"}}>
              Your name
            </label>
            <input
              value={name}
              onChange={e=>setName(e.target.value)}
              placeholder="Enter your name…"
              maxLength={60}
            />

            <label style={{display:"block",fontSize:".6rem",letterSpacing:"1.5px",
              textTransform:"uppercase",color:"rgba(212,175,55,.75)",marginBottom:".3rem"}}>
              Your secret wish
            </label>
            <textarea
              value={wish}
              onChange={e=>setWish(e.target.value.slice(0,300))}
              rows={4}
              placeholder="Write your deepest desire… the well is listening."
            />
            <div style={{textAlign:"right",fontSize:".6rem",color:"rgba(255,255,255,.22)",
              marginTop:"-.4rem",marginBottom:".9rem"}}>{wish.length}/300</div>

            {/* PayPal button — ONLY visible when form is complete */}
            {canGoToPayPal ? (
              <button
                onClick={()=>setStep(STEPS.PAYPAL)}
                style={{
                  display:"block",width:"100%",padding:"1rem",
                  background:"linear-gradient(135deg,#6a4200,#C89A18,#FFD700,#E8C030,#C89A18,#6a4200)",
                  border:"2.5px solid #FFD700",borderRadius:"11px",
                  color:"#060E22",fontFamily:"Georgia,serif",fontSize:".9rem",fontWeight:900,
                  letterSpacing:"2.5px",textTransform:"uppercase",cursor:"pointer",
                  animation:"pb 1.9s ease-in-out infinite",
                }}>
                ✦ Cast My Wish — ${level?.amount} ✦
              </button>
            ) : (
              <button disabled style={{
                display:"block",width:"100%",padding:"1rem",
                background:"rgba(60,60,60,.35)",
                border:"2px solid rgba(255,255,255,.1)",borderRadius:"11px",
                color:"rgba(255,255,255,.22)",fontFamily:"Georgia,serif",fontSize:".88rem",
                letterSpacing:"2px",textTransform:"uppercase",cursor:"not-allowed",
              }}>
                Fill your name and wish first
              </button>
            )}

            <button onClick={()=>setStep(STEPS.BUY_POPUP)}
              style={{display:"block",width:"100%",marginTop:".6rem",
                background:"transparent",border:"none",
                color:"rgba(212,175,55,.45)",fontFamily:"Georgia,serif",
                fontSize:".72rem",cursor:"pointer",textDecoration:"underline",letterSpacing:"1px",textAlign:"center"}}>
              ← Change level
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          POPUP 3: PAYPAL — SDK REAL
      ══════════════════════════════════ */}
      {step===STEPS.PAYPAL && (
        <PayPalPopup
          level={level}
          name={name}
          wish={wish}
          onSuccess={()=>setStep(STEPS.GRANTED)}
          onBack={()=>setStep(STEPS.FORM)}
        />
      )}

      {/* ══════════════════════════════════
          GRANTED SCREEN
      ══════════════════════════════════ */}
      {step===STEPS.GRANTED && (
        <div style={{position:"fixed",inset:0,zIndex:300,
          background:"rgba(6,14,34,.96)",backdropFilter:"blur(16px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}}>
          <div style={{
            background:"linear-gradient(135deg,#0c1a3a,#172e6a)",
            border:"2px solid #D4AF37",borderRadius:"22px",
            padding:"2.5rem 1.8rem",maxWidth:"380px",width:"100%",textAlign:"center",
            boxShadow:"0 0 90px rgba(212,175,55,.45),0 0 160px rgba(30,77,154,.35)",
            animation:"gr .8s cubic-bezier(.34,1.56,.64,1)",
            position:"relative",
          }}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:"3px",
              background:"linear-gradient(90deg,transparent,#FFD700,transparent)",
              borderRadius:"22px 22px 0 0"}}/>

            <div style={{fontSize:"3rem",marginBottom:".6rem",
              filter:"drop-shadow(0 0 20px rgba(255,215,0,.85))",
              animation:"lf 2s ease-in-out infinite"}}>⭐✨⭐</div>

            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",fontWeight:900,
              background:"linear-gradient(180deg,#fff9d0,#FFD700,#B88A10)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              marginBottom:".6rem",lineHeight:1.3}}>
              Your wishes will come true soon
            </h2>
            <p style={{fontFamily:"Georgia,serif",fontSize:"1rem",fontWeight:900,
              background:"linear-gradient(180deg,#fff9d0,#FFD700,#B88A10)",
              WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
              marginBottom:".5rem"}}>
              Your wish has been granted
            </p>
            <p style={{color:"rgba(255,255,255,.7)",fontStyle:"italic",
              fontSize:".88rem",lineHeight:1.65,marginBottom:"1.4rem"}}>
              Your wish has been cast into the waters of possibility,{" "}
              <strong style={{color:"#FFD700"}}>{name}</strong>.<br/>
              The well has heard you. ✦
            </p>

            <button onClick={resetScene} style={{
              display:"block",width:"100%",padding:".9rem",
              background:"transparent",
              border:"1.5px solid rgba(212,175,55,.5)",borderRadius:"11px",
              color:"rgba(212,175,55,.85)",fontFamily:"Georgia,serif",
              fontSize:".78rem",letterSpacing:"2px",
              textTransform:"uppercase",cursor:"pointer",
              transition:"all .25s",
            }}>
              ← Cast Another Wish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
